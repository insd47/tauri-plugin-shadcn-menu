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
} from './components/context-menu';
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
} from './components/dropdown-menu';
import type { MenuEntry } from './types';

function MenuIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons];
  if (!Icon) return null;
  return <Icon />;
}

function renderEntry(entry: MenuEntry, index: number): ReactNode {
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
        {entry.shortcut && <ContextMenuShortcut>{entry.shortcut}</ContextMenuShortcut>}
      </ContextMenuCheckboxItem>
    );
  }

  // Default: action item
  return (
    <ContextMenuItem key={index} disabled={entry.disabled} onSelect={() => entry.action?.()}>
      {entry.icon && <MenuIcon name={entry.icon} />}
      {entry.label}
      {entry.shortcut && <ContextMenuShortcut>{entry.shortcut}</ContextMenuShortcut>}
    </ContextMenuItem>
  );
}

interface WebMenuProps {
  menu: MenuEntry[];
  children: ReactNode;
}

export function WebContextMenu({ menu, children }: WebMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>{menu.map(renderEntry)}</ContextMenuContent>
    </ContextMenu>
  );
}

function renderDropdownEntry(entry: MenuEntry, index: number): ReactNode {
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
        {entry.shortcut && <DropdownMenuShortcut>{entry.shortcut}</DropdownMenuShortcut>}
      </DropdownMenuCheckboxItem>
    );
  }

  return (
    <DropdownMenuItem key={index} disabled={entry.disabled} onSelect={() => entry.action?.()}>
      {entry.icon && <MenuIcon name={entry.icon} />}
      {entry.label}
      {entry.shortcut && <DropdownMenuShortcut>{entry.shortcut}</DropdownMenuShortcut>}
    </DropdownMenuItem>
  );
}

export function WebDropdownMenu({ menu, children }: WebMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>{menu.map(renderDropdownEntry)}</DropdownMenuContent>
    </DropdownMenu>
  );
}
