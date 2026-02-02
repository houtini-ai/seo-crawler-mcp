/**
 * Debug logging utility
 * Set DEBUG=true in environment to enable debug output
 */

const DEBUG_ENABLED = process.env.DEBUG === 'true';

export function debug(...args: any[]): void {
  if (DEBUG_ENABLED) {
    console.error('[DEBUG]', ...args);
  }
}
