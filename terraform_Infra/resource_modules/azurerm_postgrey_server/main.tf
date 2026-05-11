resource "azurerm_postgresql_flexible_server" "postgresql-servers" {
    for_each = var.postgresql-server-with-db
  name                         = each.value.sql_server_name
  resource_group_name          = each.value.resource_group_name
  location                     = each.value.location
  version                      = each.value.version
  sku_name   = each.value.sku_name
  administrator_login          = each.value.administrator_login
  administrator_password = each.value.administrator_password
  tags = each.value.tags
  storage_mb = each.value.storage_mb
  auto_grow_enabled           = true
  backup_retention_days       = 7
  geo_redundant_backup_enabled = false
  
}

# resource "azurerm_postgresql_flexible_server_firewall_rule" "allow-access-to-azure-services" {
#     for_each = var.postgresql-server-with-db
#   name             =each.value.firewall_rule
#   server_id        = azurerm_postgresql_flexible_server.postgresql-servers[each.key].id
#   start_ip_address = "0.0.0.0"
#   end_ip_address   = "0.0.0.0"
# }

resource "azurerm_postgresql_flexible_server_database" "pg_db" {
  for_each  = var.postgresql-server-with-db
  name      = each.value.db_name
  server_id = azurerm_postgresql_flexible_server.postgresql-servers[each.key].id
  charset   = "UTF8"
  collation = "en_US.utf8"
}