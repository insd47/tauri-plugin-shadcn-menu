mod commands;
pub mod error;
pub mod types;

#[cfg(target_os = "macos")]
mod builder;
#[cfg(target_os = "macos")]
mod symbol;

use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("shadcn-menu")
        .invoke_handler(tauri::generate_handler![commands::show_context_menu])
        .build()
}
