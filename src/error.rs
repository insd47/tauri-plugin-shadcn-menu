use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Tauri(#[from] tauri::Error),

    #[error("{0}")]
    Menu(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, Error>;
