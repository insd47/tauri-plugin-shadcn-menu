'use client';

import { type MouseEvent, type ReactNode, useCallback, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { platform } from '@tauri-apps/plugin-os';
import type { MenuEntry } from './types';
import { filterByPlatform } from './lib/filter';
import { showNativeMenu } from './lib/native';
import { WebContextMenu, WebDropdownMenu } from './components/web-menu';

export type { MenuEntry } from './types';
export type {
  MenuActionItem,
  MenuCheckboxItem,
  MenuSubmenuItem,
  MenuSeparator,
  MenuItemBase,
} from './types';

interface NativeMenuProps {
  menu: MenuEntry[];
  level?: number;
  children: ReactNode;
}

export function NativeContextMenu({ menu, level, children }: NativeMenuProps) {
  const current = platform();
  const filtered = useMemo(() => filterByPlatform(menu, current), [menu, current]);

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      void showNativeMenu(filtered, e.clientX, e.clientY, level);
    },
    [filtered, level],
  );

  if (current === 'macos') {
    return <div onContextMenu={handleContextMenu}>{children}</div>;
  }

  return <WebContextMenu menu={filtered}>{children}</WebContextMenu>;
}

export function NativeDropdownMenu({ menu, level, children }: NativeMenuProps) {
  const current = platform();
  const filtered = useMemo(() => filterByPlatform(menu, current), [menu, current]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.bottom;
      void showNativeMenu(filtered, x, y, level);
    },
    [filtered, level],
  );

  if (current === 'macos') {
    return <Slot onClick={handleClick}>{children}</Slot>;
  }

  return <WebDropdownMenu menu={filtered}>{children}</WebDropdownMenu>;
}

export { showNativeMenu } from './lib/native';
export { filterByPlatform } from './lib/filter';
export { formatForDisplay, toNativeAccelerator, parseAccelerator, getDisplayParts, isCmdOrCtrl, toEventKey } from './lib/accelerator';
export type { ParsedAccelerator, NativeAccelerator } from './lib/accelerator';
export { useAccelerator } from './hooks/use-accelerator';
export { Accelerator } from './components/accelerator';
export { Kbd, KbdGroup } from './components/kbd';
