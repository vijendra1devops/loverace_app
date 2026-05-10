data "azurerm_service_plan" "data-app-sp"{
    for_each = var.webapps
name = each.value.webapp-sp_name
resource_group_name = each.value.service_plan_rg
}