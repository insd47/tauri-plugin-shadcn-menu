use crate::error::Result;
use crate::types::MenuEntry;
use tauri::{command, AppHandle, Runtime, WebviewWindow};

#[command]
pub fn show_context_menu<R: Runtime>(
    app: AppHandle<R>,
    window: WebviewWindow<R>,
    entries: Vec<MenuEntry>,
    x: f64,
    y: f64,
    level: Option<i32>,
) -> Result<()> {
    #[cfg(target_os = "macos")]
    return crate::builder::build_and_popup(&app, &entries, &window, x, y, level);
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (app, window, entries, x, y, level);
        Err(crate::error::Error::Menu(
            "Native context menu is only supported on macOS".into(),
        ))
    }
}
