import { execFileSync } from 'node:child_process';

export function paste() {
  // todo: support other platforms
  execFileSync('osascript', ['-e', 'tell application "System Events" to keystroke "v" using {command down}']);
}
