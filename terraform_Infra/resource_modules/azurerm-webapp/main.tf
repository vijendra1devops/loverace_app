resource "azurerm_windows_web_app" "webapp12" {
    for_each = var.webapps
  name                = each.value.webapp_name
  resource_group_name =  each.value.resource_group_name
  location            = each.value.location
  service_plan_id     = data.azurerm_service_plan.data-app-sp[each.key].id
  https_only = each.value. https_only
  client_affinity_enabled = each.value.client_affinity_enabled
  site_config {
    always_on = each.value.always_on
    use_32_bit_worker = each.value.use_32_bit_worker
    ftps_state = each.value.ftps_state
    minimum_tls_version = each.value.minimum_tls_version
    scm_type = each.value.scm_type
    health_check_path = each.value.health_check_path
        }
        identity {
          type = each.value.identity_type
        }
        app_settings = {
          "WEBSITE_RUN_FROM_PACKAGE" = each.value.WEBSITE_RUN_FROM_PACKAGE
          "ENVIRONMENT" = each.value.app_settings_environment
        }
        tags = {
          enviroment =each.value.enviroment
          project = each.value.project
        }
  }
