variable "webapps" {
  description = "Map of web apps to be created"
  type = map(object({
    webapp_name               = string
    resource_group_name       = string
    location                  = string
    webapp-sp_name            = string
    service_plan_rg           = optional(string)
    https_only                = optional(bool, true)
    client_affinity_enabled   = optional(bool, false)
    always_on                 = optional(bool, true)
    use_32_bit_worker         = optional(bool, false)
    ftps_state                = optional(string, "FtpsOnly")
    minimum_tls_version       = optional(string, "1.2")
    scm_type                  = optional(string)
    health_check_path         = optional(string,)
    identity_type             = optional(string, "SystemAssigned")
    WEBSITE_RUN_FROM_PACKAGE  = optional(string, "1")
    app_settings_environment  = optional(string, "dev")
    enviroment                = optional(string, "dev")
    project                   = optional(string, "demo")
  }))
}