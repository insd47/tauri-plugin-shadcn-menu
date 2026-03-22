'use client';

import { useEffect } from 'react';
import { platform } from '@tauri-apps/plugin-os';
import { parseAccelerator, isCmdOrCtrl, toEventKey } from '../lib/accelerator';

export function useAccelerator(accelerator: string, callback: () => void) {
  useEffect(() => {
    const isMac = platform() === 'macos';
    const hasCmdOrCtrl = isCmdOrCtrl(accelerator);
    const parsed = parseAccelerator(accelerator);
    const expectedKey = toEventKey(parsed.key);

    function handleKeyDown(e: KeyboardEvent) {
      // Match key (case-insensitive for single characters)
      const keyMatch =
        expectedKey.length === 1
          ? e.key.toUpperCase() === expectedKey.toUpperCase()
          : e.key === expectedKey;
      if (!keyMatch) return;

      // Match modifiers
      if (hasCmdOrCtrl) {
        if (isMac ? !e.metaKey : !e.ctrlKey) return;
      } else {
        if (parsed.modifiers.ctrl !== e.ctrlKey) return;
        if (parsed.modifiers.meta !== e.metaKey) return;
      }
      if (parsed.modifiers.shift !== e.shiftKey) return;
      if (parsed.modifiers.alt !== e.altKey) return;

      e.preventDefault();
      callback();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [accelerator, callback]);
}
