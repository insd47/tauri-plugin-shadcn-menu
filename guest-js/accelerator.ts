export interface ParsedAccelerator {
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
  key: string;
}

const MODIFIER_MAP: Record<string, keyof ParsedAccelerator['modifiers']> = {
  CTRL: 'ctrl',
  CONTROL: 'ctrl',
  SHIFT: 'shift',
  ALT: 'alt',
  OPTION: 'alt',
  COMMAND: 'meta',
  CMD: 'meta',
  SUPER: 'meta',
  META: 'meta',
};

const CMD_OR_CTRL_ALIASES = new Set([
  'COMMANDORCONTROL',
  'COMMANDORCTRL',
  'CMDORCTRL',
  'CMDORCONTROL',
]);

const DISPLAY_KEY_MAP: Record<string, string> = {
  ARROWUP: '↑',
  ARROWDOWN: '↓',
  ARROWLEFT: '←',
  ARROWRIGHT: '→',
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
  ENTER: '↵',
  ESCAPE: 'Esc',
  ESC: 'Esc',
  BACKSPACE: '⌫',
  DELETE: '⌦',
  TAB: 'Tab',
  SPACE: 'Space',
  HOME: 'Home',
  END: 'End',
  PAGEUP: 'PgUp',
  PAGEDOWN: 'PgDn',
  PLUS: '+',
};

// macOS uses special symbols for modifiers and keys
const MAC_MODIFIER_SYMBOLS = {
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
  meta: '⌘',
};

const MAC_KEY_MAP: Record<string, string> = {
  ARROWUP: '↑',
  ARROWDOWN: '↓',
  ARROWLEFT: '←',
  ARROWRIGHT: '→',
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
  ENTER: '↩',
  ESCAPE: '⎋',
  ESC: '⎋',
  BACKSPACE: '⌫',
  DELETE: '⌦',
  TAB: '⇥',
  SPACE: '␣',
  HOME: '↖',
  END: '↘',
  PAGEUP: '⇞',
  PAGEDOWN: '⇟',
  PLUS: '+',
};

// Key equivalent mapping for NSMenuItem (lowercase single char or special)
const NS_KEY_EQUIVALENT_MAP: Record<string, string> = {
  ARROWUP: String.fromCharCode(0xf700),
  ARROWDOWN: String.fromCharCode(0xf701),
  ARROWLEFT: String.fromCharCode(0xf702),
  ARROWRIGHT: String.fromCharCode(0xf703),
  UP: String.fromCharCode(0xf700),
  DOWN: String.fromCharCode(0xf701),
  LEFT: String.fromCharCode(0xf702),
  RIGHT: String.fromCharCode(0xf703),
  ENTER: '\r',
  ESCAPE: String.fromCharCode(0x1b),
  ESC: String.fromCharCode(0x1b),
  BACKSPACE: String.fromCharCode(0x08),
  DELETE: String.fromCharCode(0xf728),
  TAB: '\t',
  SPACE: ' ',
  HOME: String.fromCharCode(0xf729),
  END: String.fromCharCode(0xf72b),
  PAGEUP: String.fromCharCode(0xf72c),
  PAGEDOWN: String.fromCharCode(0xf72d),
  F1: String.fromCharCode(0xf704),
  F2: String.fromCharCode(0xf705),
  F3: String.fromCharCode(0xf706),
  F4: String.fromCharCode(0xf707),
  F5: String.fromCharCode(0xf708),
  F6: String.fromCharCode(0xf709),
  F7: String.fromCharCode(0xf70a),
  F8: String.fromCharCode(0xf70b),
  F9: String.fromCharCode(0xf70c),
  F10: String.fromCharCode(0xf70d),
  F11: String.fromCharCode(0xf70e),
  F12: String.fromCharCode(0xf70f),
};

export function parseAccelerator(accelerator: string): ParsedAccelerator {
  const parts = accelerator.split('+').map((s) => s.trim());
  const modifiers = { ctrl: false, shift: false, alt: false, meta: false };
  let key = '';

  for (const part of parts) {
    const upper = part.toUpperCase();

    if (CMD_OR_CTRL_ALIASES.has(upper)) {
      // Will be resolved per-platform at display/serialization time
      modifiers.meta = true;
      modifiers.ctrl = true;
      continue;
    }

    const mod = MODIFIER_MAP[upper];
    if (mod) {
      modifiers[mod] = true;
      continue;
    }

    key = part;
  }

  return { modifiers, key };
}

function isCmdOrCtrl(accelerator: string): boolean {
  return accelerator
    .split('+')
    .some((s) => CMD_OR_CTRL_ALIASES.has(s.trim().toUpperCase()));
}

export function formatForDisplay(accelerator: string, isMac: boolean): string {
  const hasCmdOrCtrl = isCmdOrCtrl(accelerator);
  const parsed = parseAccelerator(accelerator);
  const parts: string[] = [];

  if (isMac) {
    // macOS: use symbols, order: ⌃⌥⇧⌘
    if (parsed.modifiers.ctrl && !hasCmdOrCtrl) parts.push(MAC_MODIFIER_SYMBOLS.ctrl);
    if (parsed.modifiers.alt) parts.push(MAC_MODIFIER_SYMBOLS.alt);
    if (parsed.modifiers.shift) parts.push(MAC_MODIFIER_SYMBOLS.shift);
    if (hasCmdOrCtrl) parts.push(MAC_MODIFIER_SYMBOLS.meta);
    else if (parsed.modifiers.meta) parts.push(MAC_MODIFIER_SYMBOLS.meta);

    const upperKey = parsed.key.toUpperCase();
    const displayKey = MAC_KEY_MAP[upperKey] ?? parsed.key.toUpperCase();
    parts.push(displayKey);
    return parts.join('');
  }

  // Windows/Linux: use text
  if (parsed.modifiers.ctrl || hasCmdOrCtrl) parts.push('Ctrl');
  if (parsed.modifiers.alt) parts.push('Alt');
  if (parsed.modifiers.shift) parts.push('Shift');
  if (parsed.modifiers.meta && !hasCmdOrCtrl) parts.push('Win');

  const upperKey = parsed.key.toUpperCase();
  const displayKey = DISPLAY_KEY_MAP[upperKey] ?? parsed.key.toUpperCase();
  parts.push(displayKey);
  return parts.join('+');
}

// NSEventModifierFlags values
const NSEventModifierFlagShift = 1 << 17;
const NSEventModifierFlagControl = 1 << 18;
const NSEventModifierFlagOption = 1 << 19;
const NSEventModifierFlagCommand = 1 << 20;

export interface NativeAccelerator {
  keyEquivalent: string;
  modifierMask: number;
}

export function toNativeAccelerator(accelerator: string): NativeAccelerator {
  const hasCmdOrCtrl = isCmdOrCtrl(accelerator);
  const parsed = parseAccelerator(accelerator);

  let modifierMask = 0;
  if (hasCmdOrCtrl || parsed.modifiers.meta) modifierMask |= NSEventModifierFlagCommand;
  if (parsed.modifiers.ctrl && !hasCmdOrCtrl) modifierMask |= NSEventModifierFlagControl;
  if (parsed.modifiers.shift) modifierMask |= NSEventModifierFlagShift;
  if (parsed.modifiers.alt) modifierMask |= NSEventModifierFlagOption;

  const upperKey = parsed.key.toUpperCase();
  const keyEquivalent = NS_KEY_EQUIVALENT_MAP[upperKey] ?? parsed.key.toLowerCase();

  return { keyEquivalent, modifierMask };
}
