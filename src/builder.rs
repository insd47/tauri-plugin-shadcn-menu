use super::symbol;
use super::types::MenuEntry;
use crate::error::Result;
use objc2::rc::{Allocated, Retained};
use objc2::runtime::{AnyClass, AnyObject, ClassBuilder, Sel};
use objc2::{class, msg_send, sel};
use objc2_foundation::NSString;
use std::cell::RefCell;
use std::sync::OnceLock;
use tauri::{AppHandle, Emitter, Runtime, WebviewWindow};

const ICON_SIZE: f64 = 13.0;

thread_local! {
    static CLICKED_ID: RefCell<Option<String>> = const { RefCell::new(None) };
}

fn delegate_class() -> &'static AnyClass {
    static CLASS: OnceLock<&'static AnyClass> = OnceLock::new();
    CLASS.get_or_init(|| {
        let superclass = class!(NSObject);
        let mut builder = ClassBuilder::new(c"ShadcnMenuDelegate", superclass)
            .expect("Failed to create ShadcnMenuDelegate class");

        unsafe {
            builder.add_method(
                sel!(menuItemClicked:),
                menu_item_clicked as unsafe extern "C" fn(*mut AnyObject, Sel, *mut AnyObject),
            );
        }

        builder.register()
    })
}

unsafe extern "C" fn menu_item_clicked(_this: *mut AnyObject, _sel: Sel, sender: *mut AnyObject) {
    unsafe {
        let represented: *mut AnyObject = msg_send![sender, representedObject];
        if !represented.is_null() {
            let utf8: *const std::ffi::c_char = msg_send![represented, UTF8String];
            if !utf8.is_null() {
                if let Ok(id) = std::ffi::CStr::from_ptr(utf8).to_str() {
                    CLICKED_ID.with(|cell| {
                        *cell.borrow_mut() = Some(id.to_string());
                    });
                }
            }
        }
    }
}

pub fn build_and_popup<R: Runtime>(
    app: &AppHandle<R>,
    entries: &[MenuEntry],
    window: &WebviewWindow<R>,
    x: f64,
    y: f64,
    level: Option<i32>,
) -> Result<()> {
    unsafe {
        let menu = build_ns_menu(entries)?;
        let ns_window = window.ns_window()?;
        let ns_window_ptr = ns_window as *mut AnyObject;
        let content_view: *mut AnyObject = msg_send![ns_window_ptr, contentView];
        let frame: objc2_foundation::NSRect = msg_send![content_view, frame];
        let location = objc2_foundation::NSPoint::new(x, frame.size.height - y);

        // Temporarily elevate window level so the popup menu appears above kiosk windows
        let original_level: isize = msg_send![ns_window_ptr, level];
        if let Some(level) = level {
            let _: () = msg_send![ns_window_ptr, setLevel: level as isize];
        }

        // Clear any previous click state
        CLICKED_ID.with(|cell| *cell.borrow_mut() = None);

        // popUpMenu is blocking — runs a modal event loop until dismissed
        let _: () = msg_send![
            &menu,
            popUpMenuPositioningItem: std::ptr::null::<AnyObject>(),
            atLocation: location,
            inView: content_view
        ];

        // Restore original window level
        if level.is_some() {
            let _: () = msg_send![ns_window_ptr, setLevel: original_level];
        }

        // Emit event with the clicked item's ID (set during the modal loop)
        if let Some(id) = CLICKED_ID.with(|cell| cell.borrow_mut().take()) {
            let _ = app.emit("shadcn-menu:click", id);
        }
    }

    Ok(())
}

unsafe fn build_ns_menu(entries: &[MenuEntry]) -> Result<Retained<AnyObject>> {
    let menu: Retained<AnyObject> = msg_send![class!(NSMenu), new];
    let _: () = msg_send![&menu, setAutoenablesItems: false];

    for entry in entries {
        let item = build_ns_menu_item(entry)?;
        let _: () = msg_send![&menu, addItem: &*item];
    }

    Ok(menu)
}

unsafe fn build_ns_menu_item(entry: &MenuEntry) -> Result<Retained<AnyObject>> {
    match entry {
        MenuEntry::Separator => {
            let item: Retained<AnyObject> = msg_send![class!(NSMenuItem), separatorItem];
            Ok(item)
        }
        MenuEntry::Item(item) => {
            let ns_item = create_ns_menu_item(&item.label, !item.disabled)?;
            apply_sf_symbol(&ns_item, item.sf_symbol.as_deref());
            apply_key_equivalent(&ns_item, item.key_equivalent.as_deref());
            set_item_callback(&ns_item, &item.id);
            Ok(ns_item)
        }
        MenuEntry::Checkbox(item) => {
            let ns_item = create_ns_menu_item(&item.label, !item.disabled)?;
            let state: isize = if item.checked { 1 } else { 0 };
            let _: () = msg_send![&ns_item, setState: state];
            apply_sf_symbol(&ns_item, item.sf_symbol.as_deref());
            apply_key_equivalent(&ns_item, item.key_equivalent.as_deref());
            set_item_callback(&ns_item, &item.id);
            Ok(ns_item)
        }
        MenuEntry::Submenu(item) => {
            let ns_item = create_ns_menu_item(&item.label, !item.disabled)?;
            apply_sf_symbol(&ns_item, item.sf_symbol.as_deref());
            let submenu = build_ns_menu(&item.children)?;
            let _: () = msg_send![&ns_item, setSubmenu: &*submenu];
            Ok(ns_item)
        }
    }
}

unsafe fn apply_sf_symbol(ns_item: &AnyObject, sf_symbol: Option<&str>) {
    if let Some(icon) = sf_symbol.and_then(|s| symbol::render(s, ICON_SIZE)) {
        let _: () = msg_send![ns_item, setImage: &*icon];
    }
}

unsafe fn apply_key_equivalent(ns_item: &AnyObject, key: Option<&str>) {
    if let Some(key) = key {
        let key_str = NSString::from_str(key);
        let _: () = msg_send![ns_item, setKeyEquivalent: &*key_str];
    }
}

unsafe fn create_ns_menu_item(label: &str, enabled: bool) -> Result<Retained<AnyObject>> {
    let title = NSString::from_str(label);
    let key = NSString::from_str("");

    let ns_item: Allocated<AnyObject> = msg_send![class!(NSMenuItem), alloc];
    let ns_item: Option<Retained<AnyObject>> = msg_send![
        ns_item,
        initWithTitle: &*title,
        action: std::ptr::null::<AnyObject>(),
        keyEquivalent: &*key
    ];
    let ns_item =
        ns_item.ok_or_else(|| crate::error::Error::Menu("Failed to create NSMenuItem".into()))?;

    let _: () = msg_send![&ns_item, setEnabled: enabled];
    Ok(ns_item)
}

unsafe fn set_item_callback(ns_item: &AnyObject, id: &str) {
    let id_str = NSString::from_str(id);
    let _: () = msg_send![ns_item, setRepresentedObject: &*id_str];

    let action = sel!(menuItemClicked:);
    let _: () = msg_send![ns_item, setAction: action];

    // Create delegate instance as target
    let delegate_cls = delegate_class();
    let delegate: Retained<AnyObject> = msg_send![delegate_cls, new];
    let _: () = msg_send![ns_item, setTarget: &*delegate];
}
