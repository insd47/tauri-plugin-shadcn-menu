use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum MenuEntry {
    #[serde(alias = "item")]
    Item(MenuActionItem),
    Checkbox(MenuCheckboxItem),
    Submenu(MenuSubmenuItem),
    Separator,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MenuActionItem {
    pub id: String,
    pub label: String,
    #[serde(default)]
    pub sf_symbol: Option<String>,
    #[serde(default)]
    pub key_equivalent: Option<String>,
    #[serde(default)]
    pub disabled: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MenuCheckboxItem {
    pub id: String,
    pub label: String,
    #[serde(default)]
    pub sf_symbol: Option<String>,
    #[serde(default)]
    pub key_equivalent: Option<String>,
    #[serde(default)]
    pub disabled: bool,
    #[serde(default)]
    pub checked: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MenuSubmenuItem {
    pub label: String,
    #[serde(default)]
    pub sf_symbol: Option<String>,
    #[serde(default)]
    pub disabled: bool,
    pub children: Vec<MenuEntry>,
}
