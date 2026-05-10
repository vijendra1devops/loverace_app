# Existing Virtual Network and subnets are created by the parent dev environment module.
# Create Public Ip for Appliaction Gateway
 resource "azurerm_public_ip" "pip" {
  for_each = var.aks-clusters
  name                = each.value.pip_name
  resource_group_name = each.value.resource_group_name
  location            = each.value.location
  allocation_method   = each.value.allocation_method
  sku                 = each.value.sku
}

resource "azurerm_user_assigned_identity" "ingress" {
  for_each = var.aks-clusters

  name                = each.value.agis_name
  resource_group_name = each.value.resource_group_name
  location            = each.value.location
}

# Create Application Gateway
resource "azurerm_application_gateway" "appgwy" {
  depends_on = [ data.azurerm_subnet.appgwy-sub-data,azurerm_public_ip.pip ]
  for_each = var.aks-clusters
  name                = each.value.app_gway_name
  resource_group_name = each.value.resource_group_name
  location            = each.value.location

  sku {
    name     =each.value.sku_name
    tier     =each.value.sku_tier
    capacity =each.value.capacity
  }

  gateway_ip_configuration {
    name      =each.value.gateway_ip_configuration
    subnet_id =data.azurerm_subnet.appgwy-sub-data[each.key].id
  }

  frontend_port {
    name = each.value.frontend_port_name
    port =each.value.port
  }

  frontend_ip_configuration {
    name                 = each.value.frontend_ip_configuration_name
    public_ip_address_id = azurerm_public_ip.pip[each.key].id
  }

  backend_address_pool {
    name =each.value.backend_address_pool_name
    
  }

  backend_http_settings {
    name                  =each.value.backend_http_settings_name
    cookie_based_affinity =each.value.cookie_based_affinity
    port                  = each.value.port
    protocol              = each.value.protocol
    request_timeout       = each.value.request_timeout
  }

  http_listener {
    name                           =each.value.http_listener_name
    frontend_ip_configuration_name =each.value.frontend_ip_configuration_name
    frontend_port_name             =each.value.frontend_port_name
    protocol                       = each.value.protocol
  }

  request_routing_rule {
    name                       =each.value.request_routing_rule
    priority                   = each.value.priority
    rule_type                  = each.value.rule_type
    http_listener_name         =each.value.http_listener_name
    backend_address_pool_name  = each.value.backend_address_pool_name
    backend_http_settings_name = each.value.backend_http_settings_name
  }
}

# Create AKS Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  depends_on          = [azurerm_application_gateway.appgwy]
  for_each            = var.aks-clusters
  name                = each.value.cluster_name
  location            = each.value.location
  resource_group_name = each.value.resource_group_name
  dns_prefix          = each.value.dns_prefix

  dynamic "default_node_pool" {
    for_each = each.value.default_node_pools
    content {
      name           = default_node_pool.value.node_pool_name
      vm_size        = default_node_pool.value.vm_size
      node_count     = default_node_pool.value.node_count
      vnet_subnet_id = data.azurerm_subnet.cluster-sub-data[each.key].id
    }
  }
  identity {
    type = "SystemAssigned"
  }


  ingress_application_gateway {
    gateway_id = azurerm_application_gateway.appgwy[each.key].id
    
  }

  network_profile {
    network_plugin = each.value.network_plugin
    network_policy = each.value.network_policy
    service_cidr   = each.value.service_cidr
    dns_service_ip = each.value.dns_service_ip
  }

  tags = each.value.tags
}

resource "azurerm_role_assignment" "acr-role-assignment" {

  for_each                         = var.aks-clusters
  principal_id                     = azurerm_kubernetes_cluster.aks[each.key].kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = data.azurerm_container_registry.data-acr[each.key].id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "ingress-contributor-role-assignment" {

  for_each = var.aks-clusters
  principal_id = azurerm_user_assigned_identity.ingress[each.key].principal_id
  role_definition_name = "Contributor"
  scope = azurerm_application_gateway.appgwy[each.key].id
  skip_service_principal_aad_check = true
}
resource "azurerm_role_assignment" "ingress-network-role-assignment" {

  for_each = var.aks-clusters
  principal_id = azurerm_user_assigned_identity.ingress[each.key].principal_id
  role_definition_name = "Network Contributor"
  scope = data.azurerm_virtual_network.vnet[each.key].id
  skip_service_principal_aad_check = true
}