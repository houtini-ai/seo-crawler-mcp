# Storage Cleanup Bug Fix - v2.0.1

**Date:** 2026-02-02  
**Version:** 2.0.0 → 2.0.1  
**Issue:** MemoryStorage not being cleaned up between crawls

---

## Problem

The v2.0.0 fix added isolated MemoryStorage per crawl but **didn't clean it up**. The comment said:

```typescript
// No explicit cleanup needed - MemoryStorage is garbage collected
// and Crawlee automatically purges default storages
```

**This was wrong.** Without explicit cleanup:
- MemoryStorage instances stayed in memory with stale RequestQueue data
- Node.js GC might not clean up immediately
- Next crawl could potentially reuse cached state
- Required Claude Desktop restart to fully clear memory

---

## Solution

Added `finally` block to `CrawlOrchestrator.run()` that explicitly calls `await this.memoryStorage.purge()`:

```typescript
} catch (error: any) {
  // error handling
} finally {
  // CRITICAL: Clean up isolated storage to prevent state persistence between crawls
  // This ensures each crawl starts with a fresh RequestQueue
  if (this.memoryStorage) {
    try {
      await this.memoryStorage.purge();
      console.error('[ORCH DEBUG] MemoryStorage cleaned up successfully');
    } catch (cleanupError: any) {
      console.error('[ORCH WARN] Storage cleanup failed:', cleanupError.message);
    }
  }
}

await this.storage.saveMetadata(this.metadata, this.config);
return this.metadata;
```

---

## Why This Matters

**Before (v2.0.0):**
- First crawl: ✅ Works (fresh MemoryStorage created)
- Second crawl: ⚠️ Might work, might have stale state
- Third crawl: ❌ Likely has cached data, requires restart

**After (v2.0.1):**
- First crawl: ✅ Works (fresh MemoryStorage)
- Second crawl: ✅ Works (previous storage purged)
- Third crawl: ✅ Works (guaranteed fresh state)
- N crawls: ✅ All work without restart

---

## Technical Details

**What `purge()` does:**
- Removes all data from MemoryStorage instance
- Clears RequestQueue state completely
- Forces garbage collection eligibility
- Prevents memory leaks in long-running MCP servers

**Why `finally` block:**
- Runs even if crawl fails
- Ensures cleanup happens every time
- Prevents resource leaks
- Makes debugging easier (cleanup logged)

---

## Files Changed

1. **src/core/CrawlOrchestrator.ts** - Added finally block with purge()
2. **package.json** - Version 2.0.0 → 2.0.1
3. **server.json** - Version 2.0.0 → 2.0.1
4. **src/index.ts** - Updated version comment

---

## Impact

This completes the RequestQueue isolation fix from v2.0.0. The MCP server now guarantees:
- ✅ Unlimited crawls per session
- ✅ No state leakage between crawls
- ✅ No memory leaks
- ✅ No Claude Desktop restarts needed

---

## Code Review Insight

This bug was caught during professional code review assessment. The original bugfix document (`BUGFIX-REQUESTQUEUE-2026-02-01.md`) explicitly mentioned cleanup in a finally block, but it wasn't actually implemented in the code.

**Lesson:** Always verify fixes are fully implemented, not just documented.
