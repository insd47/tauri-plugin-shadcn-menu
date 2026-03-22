# tauri-plugin-shadcn-menu

Tauri v2용 네이티브 컨텍스트 메뉴 및 드롭다운 메뉴 플러그인입니다.

macOS에서는 SF Symbols를 지원하는 네이티브 NSMenu를, 다른 플랫폼에서는 shadcn/ui 기반의 웹 메뉴를 자동으로 사용합니다. 하나의 `MenuEntry[]` 정의로 두 플랫폼을 모두 지원합니다.

## 플랫폼 지원

| 플랫폼 | 구현 방식 |
| --- | --- |
| macOS | 네이티브 NSMenu + SF Symbols |
| Windows / Linux | shadcn/ui ContextMenu, DropdownMenu |

## 설치

### Rust

```bash
cargo add tauri-plugin-shadcn-menu
```

### JavaScript

```bash
npm install tauri-plugin-shadcn-menu
```

### Peer Dependencies

웹 폴백 메뉴를 사용하려면 아래 패키지들이 프로젝트에 설치되어 있어야 합니다.

```bash
npm install radix-ui @radix-ui/react-slot lucide-react clsx tailwind-merge
```

## 설정

### 1. Rust 플러그인 등록

`src-tauri/src/lib.rs`에서 플러그인을 등록합니다.

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shadcn_menu::init())
        // ...
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 2. 권한 설정

`src-tauri/capabilities/default.json`에 권한을 추가합니다.

```json
{
  "permissions": [
    "shadcn-menu:default"
  ]
}
```

### 3. Tailwind CSS 설정

웹 폴백 메뉴의 스타일이 적용되려면, 플러그인의 컴포넌트 파일을 Tailwind가 스캔하도록 설정해야 합니다.

```css
/* Tailwind v4 */
@source "../node_modules/tauri-plugin-shadcn-menu/dist-js";
```

shadcn/ui의 CSS 변수(`--popover`, `--accent` 등)가 프로젝트의 globals.css에 정의되어 있어야 합니다.

## 사용법

### 메뉴 정의

`MenuEntry[]` 배열로 메뉴를 정의합니다. macOS와 Windows에서 동일한 정의를 사용합니다.

```tsx
import type { MenuEntry } from 'tauri-plugin-shadcn-menu';

const menu: MenuEntry[] = [
  {
    label: '복사',
    icon: 'Copy',           // lucide-react 아이콘 키 (웹 폴백용)
    sfSymbol: 'doc.on.doc', // SF Symbol 이름 (macOS 네이티브용)
    shortcut: '⌘C',         // 표시용 단축키 (웹 폴백용)
    keyEquivalent: 'c',     // NSMenuItem keyEquivalent (macOS 네이티브용)
    action: () => navigator.clipboard.writeText('...'),
  },
  { type: 'separator' },
  {
    label: '삭제',
    icon: 'Trash',
    sfSymbol: 'trash',
    action: () => handleDelete(),
  },
  {
    type: 'submenu',
    label: '공유',
    icon: 'Share',
    sfSymbol: 'square.and.arrow.up',
    children: [
      { label: '링크 복사', action: () => copyLink() },
      { label: '이메일로 공유', action: () => shareByEmail() },
    ],
  },
  {
    type: 'checkbox',
    label: '즐겨찾기',
    checked: isFavorite,
    action: (checked) => setFavorite(checked),
  },
];
```

### NativeContextMenu

우클릭 시 컨텍스트 메뉴를 표시합니다.

```tsx
import { NativeContextMenu } from 'tauri-plugin-shadcn-menu';

<NativeContextMenu menu={menu}>
  <div>우클릭하세요</div>
</NativeContextMenu>
```

### NativeDropdownMenu

클릭 시 드롭다운 메뉴를 표시합니다.

```tsx
import { NativeDropdownMenu } from 'tauri-plugin-shadcn-menu';

<NativeDropdownMenu menu={menu}>
  <button>메뉴 열기</button>
</NativeDropdownMenu>
```

### Window Level (Kiosk 모드 지원)

`level` prop으로 메뉴의 윈도우 레벨을 설정할 수 있습니다. Kiosk 모드처럼 윈도우 레벨이 높은 환경에서 메뉴가 가려지는 문제를 해결합니다.

```tsx
<NativeContextMenu menu={menu} level={1002}>
  <div>우클릭하세요</div>
</NativeContextMenu>
```

### 플랫폼별 항목 필터링

`platform` 속성으로 특정 플랫폼에서만 표시되는 항목을 정의할 수 있습니다.

```tsx
const menu: MenuEntry[] = [
  { label: 'Finder에서 열기', platform: 'macos', action: () => openInFinder() },
  { label: '탐색기에서 열기', platform: 'windows', action: () => openInExplorer() },
  { label: '모든 플랫폼 항목', action: () => commonAction() },
];
```

## MenuEntry 타입

```typescript
// 일반 메뉴 항목
interface MenuActionItem {
  type?: 'item';
  label: string;
  icon?: string;           // lucide-react 아이콘 키
  sfSymbol?: string;        // macOS SF Symbol 이름
  shortcut?: string;        // 표시용 단축키
  keyEquivalent?: string;   // macOS keyEquivalent
  disabled?: boolean;
  platform?: Platform | Platform[];
  action?: () => void;
}

// 체크박스 항목
interface MenuCheckboxItem {
  type: 'checkbox';
  label: string;
  checked: boolean;
  icon?: string;
  sfSymbol?: string;
  shortcut?: string;
  keyEquivalent?: string;
  disabled?: boolean;
  platform?: Platform | Platform[];
  action?: (checked: boolean) => void;
}

// 서브메뉴
interface MenuSubmenuItem {
  type: 'submenu';
  label: string;
  icon?: string;
  sfSymbol?: string;
  disabled?: boolean;
  platform?: Platform | Platform[];
  children: MenuEntry[];
}

// 구분선
interface MenuSeparator {
  type: 'separator';
  platform?: Platform | Platform[];
}
```

## 라이선스

MIT

---

이 프로젝트는 [Claude Code](https://claude.com/claude-code)를 사용하여 작성되었습니다.
