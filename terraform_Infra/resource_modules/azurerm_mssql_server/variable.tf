variable "mssql-server-with-db" {
  description = "Map of MSSQL Server configurations with databases and firewall rules"
  type = map(object({
    sql_server_name            = string
    resource_group_name        = string
    location                   = string
    version                    = string
    administrator_login        = string
    administrator_login_password = string
    minimum_tls_version        = string
    firewall_rule              = string
    db_name                    = string
    storage_account_type       = string
    tags                       = optional(map(string))
  }))
}