'use client';

import { useMemo, Fragment } from 'react';
import { platform } from '@tauri-apps/plugin-os';
import { getDisplayParts, formatForDisplay } from '../lib/accelerator';
import { Kbd, KbdGroup } from './kbd';

interface AcceleratorBaseProps {
  value: string;
  className?: string;
}

interface AcceleratorInlineProps extends AcceleratorBaseProps {
  group?: false;
}

interface AcceleratorGroupProps extends AcceleratorBaseProps {
  group: true;
}

type AcceleratorProps = AcceleratorInlineProps | AcceleratorGroupProps;

export function Accelerator({ value, className, group }: AcceleratorProps) {
  const isMac = platform() === 'macos';

  if (group) {
    return <AcceleratorGroup value={value} isMac={isMac} className={className} />;
  }

  return <AcceleratorInline value={value} isMac={isMac} className={className} />;
}

function AcceleratorInline({ value, isMac, className }: { value: string; isMac: boolean; className?: string }) {
  const text = useMemo(() => formatForDisplay(value, isMac), [value, isMac]);

  return (
    <kbd className={className ?? "text-muted-foreground text-xs"}>
      {text}
    </kbd>
  );
}

function AcceleratorGroup({ value, isMac, className }: { value: string; isMac: boolean; className?: string }) {
  const parts = useMemo(() => getDisplayParts(value, isMac), [value, isMac]);

  return (
    <KbdGroup className={className}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {!isMac && i > 0 && <span className="text-muted-foreground/50">+</span>}
          <Kbd>{part}</Kbd>
        </Fragment>
      ))}
    </KbdGroup>
  );
}
