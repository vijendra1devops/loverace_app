variable "dev-rgs" {}
variable "dev-service_plans" {}
variable "dev-webapps" {}
variable "dev-vnets" {}
# variable "dev-nsgs" {}
# variable "dev-win-vms" {}
# variable "dev-keyvaults" {}
# variable "ARM_CLIENT_ID" {
#   description = "Azure Service Principal Client ID"
#   type        = string
#   sensitive   = true
# }

# variable "ARM_CLIENT_SECRET" {
#   description = "Azure Service Principal Client Secret"
#   type        = string
#   sensitive   = true
# }

# variable "ARM_TENANT_ID" {
#   description = "Azure Tenant ID"
#   type        = string
#   sensitive   = true
# }

variable "ARM_SUBSCRIPTION_ID" {
  description = "Azure Subscription ID"
  type        = string
}
variable "dev-acr" {}

variable "dev-aks-clusters" {
  description = "Map of AKS clusters configuration."
  type = map(object({
    # Network configuration
    vnet_name           = string
    vnet_address_space  = list(string)
    location            = string
    resource_group_name = string
    tags                = map(string)
    subnets = map(object({
      subnet_name             = string
      subnet_address_prefixes = list(string)
    }))
    acr_name = string
    # Public IP configuration
    pip_name          = string
    allocation_method = string
    sku               = string
    # Application Gateway configuration
    cluster_name                   = string
    app_gway_name                  = string
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
    # AKS Cluster configuration
    default_node_pools = map(object({
      node_pool_name = string
      vm_size        = string
      node_count     = number
    }))

    #network profile
    dns_prefix     = string
    agis_name      = string
    network_plugin = string
    network_policy = string
    service_cidr   = string
    dns_service_ip = string
  }))
}

# variable "dev-mssql-server-with-db" {}
variable "dev-postgresql-server-with-db" {}
