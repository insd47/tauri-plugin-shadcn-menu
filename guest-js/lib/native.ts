import { invoke } from '@tauri-apps/api/core';
import { once } from '@tauri-apps/api/event';
import type { MenuEntry } from '../types';
import { v4 as uuid } from 'uuid';
import { toNativeAccelerator } from './accelerator';

interface SerializedEntry {
  type: string;
  id?: string;
  label?: string;
  sfSymbol?: string;
  keyEquivalent?: string;
  modifierMask?: number;
  disabled?: boolean;
  checked?: boolean;
  children?: SerializedEntry[];
}

function serializeEntries(
  entries: MenuEntry[],
  actionMap: Map<string, () => void>,
): SerializedEntry[] {
  return entries.map((entry) => {
    if (entry.type === 'separator') {
      return { type: 'separator' };
    }

    if (entry.type === 'submenu') {
      return {
        type: 'submenu',
        label: entry.label,
        sfSymbol: entry.sfSymbol,
        disabled: entry.disabled,
        children: serializeEntries(entry.children, actionMap),
      };
    }

    const id = uuid();
    const accel = entry.accelerator ? toNativeAccelerator(entry.accelerator) : undefined;

    if (entry.type === 'checkbox') {
      if (entry.action) {
        const checked = entry.checked;
        const action = entry.action;
        actionMap.set(id, () => action(!checked));
      }
      return {
        type: 'checkbox',
        id,
        label: entry.label,
        sfSymbol: entry.sfSymbol,
        keyEquivalent: accel?.keyEquivalent,
        modifierMask: accel?.modifierMask,
        disabled: entry.disabled,
        checked: entry.checked,
      };
    }

    // Default: action item
    if (entry.action) {
      actionMap.set(id, entry.action);
    }
    return {
      type: 'item',
      id,
      label: entry.label,
      sfSymbol: entry.sfSymbol,
      keyEquivalent: accel?.keyEquivalent,
      modifierMask: accel?.modifierMask,
      disabled: entry.disabled,
    };
  });
}

export async function showNativeMenu(
  entries: MenuEntry[],
  x: number,
  y: number,
  level?: number,
) {
  const actionMap = new Map<string, () => void>();
  const serialized = serializeEntries(entries, actionMap);

  void once<string>('shadcn-menu:click', (event) => {
    if (event.payload) {
      const action = actionMap.get(event.payload);
      action?.();
    }
  });

  await invoke('plugin:shadcn-menu|show_context_menu', { entries: serialized, x, y, level });
}
