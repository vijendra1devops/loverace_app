variable "keyvaults" {
  description = "Map of Key Vaults to create with their properties and access policies"
  type = map(object({
    name                       = string
    location                   = string
    resource_group_name        = string
    soft_delete_retention_days = optional(number, 7)
    purge_protection_enabled   = optional(bool, true)
    sku_name                   = string

    key_permissions            = optional(list(string), [])
    secret_permissions         = optional(list(string), [])
    storage_permissions        = optional(list(string), [])
    certificate_permissions    = optional(list(string), [])
  }))
}
