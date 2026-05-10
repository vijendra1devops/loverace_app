resource "azurerm_container_registry" "acrs" {
  for_each = var.acr
  name                     = each.value.name
  resource_group_name      = each.value.resource_group_name
  location                 = each.value.location
  sku                      = each.value.sku
  tags = each.value.tags
 
}