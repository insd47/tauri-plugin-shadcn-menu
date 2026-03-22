import type { icons } from 'lucide-react';
import type { Platform } from '@tauri-apps/plugin-os';

export interface MenuItemBase {
  platform?: Platform | Platform[];
  disabled?: boolean;
}

export interface MenuActionItem extends MenuItemBase {
  type?: 'item';
  label: string;
  icon?: keyof typeof icons;
  sfSymbol?: string;
  shortcut?: string;
  keyEquivalent?: string;
  action?: () => void;
}

export interface MenuCheckboxItem extends MenuItemBase {
  type: 'checkbox';
  label: string;
  icon?: keyof typeof icons;
  sfSymbol?: string;
  shortcut?: string;
  keyEquivalent?: string;
  checked: boolean;
  action?: (checked: boolean) => void;
}

export interface MenuSubmenuItem extends MenuItemBase {
  type: 'submenu';
  label: string;
  icon?: keyof typeof icons;
  sfSymbol?: string;
  children: MenuEntry[];
}

export interface MenuSeparator {
  type: 'separator';
  platform?: Platform | Platform[];
}

export type MenuEntry = MenuActionItem | MenuCheckboxItem | MenuSubmenuItem | MenuSeparator;
