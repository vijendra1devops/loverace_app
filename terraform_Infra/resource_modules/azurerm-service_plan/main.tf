resource "azurerm_service_plan" "service-plans" {
    for_each = var.service_plans
  name                = each.value.webapp-sp_name
  resource_group_name = each.value.resource_group_name
  location            = each.value.location
  sku_name            = each.value.sku_name 
  os_type             = each.value.os_type
}
