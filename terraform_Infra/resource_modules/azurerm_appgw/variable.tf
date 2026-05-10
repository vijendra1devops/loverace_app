variable "appgw" {
    description = "Map of Application Gateway configuration."
    type = map(object({
        # Application Gateway configuration
        app_gway_name                  = string
        resource_group_name           = string
        location                      = string
        tags                          = map(string)
        sku_tier                       = string
        sku_name                       = string
        capacity                       = number
        gateway_ip_configuration       = string
        frontend_port_name             = string
        port                           = number
        frontend_ip_configuration_name = string
        backend_address_pool_name      = string
        backend_http_settings_name     = string
        cookie_based_affinity          = string
        protocol                       = string
        request_timeout                = number
        request_routing_rule           = string
        priority                       = number
        rule_type                      = string
        http_listener_name             = string
    }))
}