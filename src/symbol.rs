/// Loads an SF Symbol by name (e.g. "doc.on.doc") using the system API.
/// Returns an NSImage with template mode for automatic dark/light adaptation.
#[cfg(target_os = "macos")]
pub fn render(name: &str, size: f64) -> Option<objc2::rc::Retained<objc2::runtime::AnyObject>> {
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2::{class, msg_send};
    use objc2_foundation::NSString;

    unsafe {
        let symbol_name = NSString::from_str(name);
        let description = NSString::from_str("");

        let image: Option<Retained<AnyObject>> = msg_send![
            class!(NSImage),
            imageWithSystemSymbolName: &*symbol_name,
            accessibilityDescription: &*description
        ];
        let image = image?;

        let config: Option<Retained<AnyObject>> = msg_send![
            class!(NSImageSymbolConfiguration),
            configurationWithPointSize: size,
            weight: 0isize
        ];
        if let Some(config) = config {
            let sized: Option<Retained<AnyObject>> = msg_send![
                &image,
                imageWithSymbolConfiguration: &*config
            ];
            return sized;
        }

        Some(image)
    }
}
