import type { ReactNode } from 'react';
import { icons } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from './context-menu';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from './dropdown-menu';
import type { MenuEntry } from '../types';
import { formatForDisplay } from '../lib/accelerator';

function MenuIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons];
  if (!Icon) return null;
  return <Icon />;
}

function createContextRenderer(isMac: boolean) {
  return function renderEntry(entry: MenuEntry, index: number): ReactNode {
    if (entry.type === 'separator') {
      return <ContextMenuSeparator key={index} />;
    }

    if (entry.type === 'submenu') {
      return (
        <ContextMenuSub key={index}>
          <ContextMenuSubTrigger disabled={entry.disabled}>
            {entry.icon && <MenuIcon name={entry.icon} />}
            {entry.label}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>{entry.children.map(renderEntry)}</ContextMenuSubContent>
        </ContextMenuSub>
      );
    }

    if (entry.type === 'checkbox') {
      return (
        <ContextMenuCheckboxItem
          key={index}
          checked={entry.checked}
          disabled={entry.disabled}
          onCheckedChange={(checked) => entry.action?.(checked)}
        >
          {entry.icon && <MenuIcon name={entry.icon} />}
          {entry.label}
          {entry.accelerator && <ContextMenuShortcut>{formatForDisplay(entry.accelerator, isMac)}</ContextMenuShortcut>}
        </ContextMenuCheckboxItem>
      );
    }

    // Default: action item
    return (
      <ContextMenuItem key={index} disabled={entry.disabled} onSelect={() => entry.action?.()}>
        {entry.icon && <MenuIcon name={entry.icon} />}
        {entry.label}
        {entry.accelerator && <ContextMenuShortcut>{formatForDisplay(entry.accelerator, isMac)}</ContextMenuShortcut>}
      </ContextMenuItem>
    );
  };
}

interface WebMenuProps {
  menu: MenuEntry[];
  children: ReactNode;
  isMac?: boolean;
}

export function WebContextMenu({ menu, children, isMac = false }: WebMenuProps) {
  const renderEntry = createContextRenderer(isMac);
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>{menu.map(renderEntry)}</ContextMenuContent>
    </ContextMenu>
  );
}

function createDropdownRenderer(isMac: boolean) {
  return function renderDropdownEntry(entry: MenuEntry, index: number): ReactNode {
    if (entry.type === 'separator') {
      return <DropdownMenuSeparator key={index} />;
    }

    if (entry.type === 'submenu') {
      return (
        <DropdownMenuSub key={index}>
          <DropdownMenuSubTrigger disabled={entry.disabled}>
            {entry.icon && <MenuIcon name={entry.icon} />}
            {entry.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>{entry.children.map(renderDropdownEntry)}</DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }

    if (entry.type === 'checkbox') {
      return (
        <DropdownMenuCheckboxItem
          key={index}
          checked={entry.checked}
          disabled={entry.disabled}
          onCheckedChange={(checked) => entry.action?.(checked)}
        >
          {entry.icon && <MenuIcon name={entry.icon} />}
          {entry.label}
          {entry.accelerator && <DropdownMenuShortcut>{formatForDisplay(entry.accelerator, isMac)}</DropdownMenuShortcut>}
        </DropdownMenuCheckboxItem>
      );
    }

    return (
      <DropdownMenuItem key={index} disabled={entry.disabled} onSelect={() => entry.action?.()}>
        {entry.icon && <MenuIcon name={entry.icon} />}
        {entry.label}
        {entry.accelerator && <DropdownMenuShortcut>{formatForDisplay(entry.accelerator, isMac)}</DropdownMenuShortcut>}
      </DropdownMenuItem>
    );
  };
}

export function WebDropdownMenu({ menu, children, isMac = false }: WebMenuProps) {
  const renderDropdownEntry = createDropdownRenderer(isMac);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>{menu.map(renderDropdownEntry)}</DropdownMenuContent>
    </DropdownMenu>
  );
}
