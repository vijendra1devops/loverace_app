variable "postgresql-server-with-db" {
  description = "Map of PostgreSQL servers with config"
  type = map(object({
    resource_group_name          = string
    location          = string
    sql_server_name       = string
    version           = string
    sku_name         = string
    administrator_login          = string
    administrator_password = string
    db_name           = string
    storage_mb        = number
    tags              = map(string) 
  }
  ))
}