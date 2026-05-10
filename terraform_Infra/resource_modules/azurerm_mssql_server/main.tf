resource "azurerm_mssql_server" "mssql-servers" {
    for_each = var.mssql-server-with-db
  name                         = each.value.sql_server_name
  resource_group_name          = each.value.resource_group_name
  location                     = each.value.location
  version                      = each.value.version
  administrator_login          = each.value.administrator_login
  administrator_login_password = each.value.administrator_login_password
  minimum_tls_version          = each.value.minimum_tls_version
  tags = each.value.tags
}

resource "azurerm_mssql_firewall_rule" "allow-access-to-azure-services" {
    for_each = var.mssql-server-with-db
  name             =each.value.firewall_rule
  server_id        = azurerm_mssql_server.mssql-servers[each.key].id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_mssql_database" "mssql-dbs" {
    for_each = var.mssql-server-with-db
  name         = each.value.db_name
  server_id    = azurerm_mssql_server.mssql-servers[each.key].id
storage_account_type=each.value.storage_account_type
  tags =each.value.tags
}