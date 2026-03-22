import type { Platform } from '@tauri-apps/plugin-os';
import type { MenuEntry } from '../types';

export function filterByPlatform(entries: MenuEntry[], current: Platform): MenuEntry[] {
  return entries.reduce<MenuEntry[]>((acc, entry) => {
    if (entry.platform) {
      const allowed = Array.isArray(entry.platform) ? entry.platform : [entry.platform];
      if (!allowed.includes(current)) return acc;
    }

    if (entry.type === 'submenu') {
      const children = filterByPlatform(entry.children, current);
      if (children.length > 0) {
        acc.push({ ...entry, children });
      }
    } else {
      acc.push(entry);
    }

    return acc;
  }, []);
}
