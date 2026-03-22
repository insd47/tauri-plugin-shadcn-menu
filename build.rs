const COMMANDS: &[&str] = &["show_context_menu"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
