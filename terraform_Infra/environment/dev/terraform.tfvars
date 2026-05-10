dev-rgs = {
  rg1 = {
    name     = "loverace-apprg-d01"
    location = "central India"
    tags     = { environment = "dev" }
  }
  rg2 = {
    name     = "loverace-apprg-d02"
    location = "central India"

  }
}
dev-service_plans = {
  service_plans1 = {
    webapp-sp_name      = "loverace-aspd01"
    resource_group_name = "loverace-apprg-d01"
    location            = "Central India"
    sku_name            = "S1"
    os_type             = "Windows"
  }
}

dev-webapps = {
  webapp1 = {
    webapp_name             = "loverace-webapp-d01"
    resource_group_name     = "loverace-apprg-d01"
    location                = "Central India"
    webapp-sp_name          = "loverace-aspd01"
    service_plan_rg         = "loverace-apprg-d01"
    https_only              = true
    client_affinity_enabled = false
    always_on               = true
    use_32_bit_worker       = false
    ftps_state              = "FtpsOnly"
    minimum_tls_version     = "1.2"
    # scm_type                 = "LocalGit"
    # health_check_path        = "/health"
    identity_type            = "SystemAssigned"
    WEBSITE_RUN_FROM_PACKAGE = "1"
    app_settings_environment = "dev"
    enviroment               = "dev"
    project                  = "demo-app"
  }
}

ARM_SUBSCRIPTION_ID = "c52a4790-4e95-4021-9cac-5d2b2785e2c8"

dev-vnets = {
  vnet1 = {
    name                = "loverace-vnet-d01"
    location            = "Central India"
    resource_group_name = "loverace-apprg-d01"
    address_space       = ["10.0.0.0/16"]
    # dns_servers         = ["8.8.8.8", "8.8.4.4"]

    subnets = [
      {
        name             = "frontend-subnetd01"
        address_prefixes = ["10.0.1.0/26"]
      },
      {
        name             = "backend-subnetd01"
        address_prefixes = ["10.0.2.0/26"]
      },
      {
        name             = "subnet-db"
        address_prefixes = ["10.0.3.0/26"]
      },
      {
        name             = "appgw-subnetd01"
        address_prefixes = ["10.0.4.0/26"]
      }
    ]
  }
}

# dev-win-vms = {
#   vm1 = {
#     vm_name              = "winvm01"
#     location             = "Central India"
#     resource_group_name  = "rg-vijendra1"
#     size                 = "Standard_B2ms"

#     # Optional (can be skipped if using default)
#     allocation_method             = "Static"
#     private_ip_address_allocation = "Dynamic"
#     caching                       = "ReadWrite"
#     storage_account_type          = "Standard_LRS"

#     publisher = "MicrosoftWindowsServer"
#     offer     = "WindowsServer"
#     sku       = "2019-Datacenter"
#     version   = "latest"

#     subnet_name          = "frontend-subnetd01"
#     virtual_network_name = "loverace-vnet-d01"
#     nsg_name             = "nsg-windows"
#     kv_name              = "kv-vijendra01"
#   }
#  }
# dev-keyvaults = {
#   kv1 = {
#     name                       = "kv-vijendra01"
#     location                   = "Central India"
#     resource_group_name        = "rg-vijendra1"
#     sku_name                   = "standard"

#     soft_delete_retention_days = 7
#     purge_protection_enabled   = false

#     key_permissions         = ["Get", "List", "Create"]
#     secret_permissions      = ["Get", "Set", "List", "Delete"]
#     storage_permissions     = ["Get", "Set"]
#     certificate_permissions = ["Get", "List"]
#   }
# Optional fields (use defaults if not provided)
#   key_permissions         = ["Get"]
#   secret_permissions      = ["Get", "List"]
#   certificate_permissions = []
# }

# dev-nsgs = {
#   nsg-app = {
#     name                = "nsg-windows"
#     location            = "Central India"
#     resource_group_name = "rg-vijendra1"

#     security_rules = [{
#       # {
#       #   name                       = "allow-http"
#       #   priority                   = 110
#       #   direction                  = "Inbound"
#       #   access                     = "Allow"
#       #   protocol                   = "Tcp"
#       #   source_port_range          = "*"
#       #   destination_port_range     = "80"
#       #   source_address_prefix      = "*"
#       #   destination_address_prefix = "*"
#       # }
#       # {
#         name                       = "allow-RDP"
#         priority                   = 100
#         direction                  = "Inbound"
#         access                     = "Allow"
#         protocol                   = "Tcp"
#         source_port_range          = "*"
#         destination_port_range     = "3389"
#         source_address_prefix   = "*"
#         destination_address_prefix = "*"
#       }
#     ]
#   }
# }

dev-acr = {
  dev-acr1 = {
    name                = "loveraceacrd01"
    resource_group_name = "loverace-apprg-d01"
    location            = "Central India"
    sku                 = "Standard"
    tags = {
      environment = "dev"
      owner       = "loveraceteam"
      application = "loverace"
      region      = "Central India"
      project     = "loverace"
} } }

dev-aks-clusters = {
  cluster = {
    vnet_name          = "loverace-vnet-d01"
    vnet_address_space = ["10.0.0.0/16"]
    subnets = {
      subnet1 = {
        subnet_name             = "backend-subnetd01"
        subnet_address_prefixes = ["10.0.2.0/26"]
      }
      subnet2 = {
        subnet_name             = "appgw-subnetd01"
        subnet_address_prefixes = ["10.0.4.0/26"]
      }
    }
    resource_group_name = "loverace-apprg-d01"
    location            = "Central India"
    tags = {
      environment = "dev"
      owner       = "loveraceteam"
      application = "loverace"
      region      = "Central India"
      project     = "loverace"
    }

    acr_name                       = "loveraceacrd01"
    pip_name                       = "loverace-pip-d01"
    allocation_method              = "Static"
    sku                            = "Standard"
    cluster_name                   = "loverace-aks-d01"
    app_gway_name                  = "loverace-appgw-d01"
    sku_name                       = "Standard_v2"
    sku_tier                       = "Standard_v2"
    capacity                       = 2
    gateway_ip_configuration       = "appgw-ipcfg"
    frontend_port_name             = "appgw-frontend-port"
    port                           = 80
    frontend_ip_configuration_name = "appgw-frontend-ip"
    backend_address_pool_name      = "appgw-backendpool"
    backend_http_settings_name     = "appgw-backendhttp"
    cookie_based_affinity          = "Disabled"
    protocol                       = "Http"
    request_timeout                = 30
    request_routing_rule           = "appgw-routing-rule"
    priority                       = 1
    rule_type                      = "Basic"
    http_listener_name             = "appgw-listener"
    dns_prefix                     = "loveraceaksdev"
    agis_name                      = "ingressapplicationgateway-loverace-aks-d01"
    network_plugin                 = "azure"
    network_policy                 = "azure"
    service_cidr                   = "10.100.0.0/16"
    dns_service_ip                 = "10.100.0.10"
    default_node_pools = {
      nodepool1 = {
        node_pool_name = "agentpool"
        vm_size        = "Standard_DS2_v2"
        node_count     = 2
      }
    }
  }
}

# dev-mssql-server-with-db = {
#   "mssql-server-1" = {
#     sql_server_name              = "dev-loverace-server"
#     resource_group_name          = "rg-vijendra1"
#     location                     = "Central India"
#     version                      = "12.0"
#     administrator_login          = "loverace"
#     administrator_login_password = "Dhaisabg@1392!"
#     minimum_tls_version          = "1.2"
#     firewall_rule                = "allow-access-to-azure-services"
#     db_name                      = "dev-loverace-database"
#     storage_account_type         = "Local"
#     tags = {
#       environment = "dev"
#       owner       = "loveraceteam"
#       application = "loverace"
#       region      = "Central India"
#       project     = "loverace"
#     }
#   }
# }
dev-postgresql-server-with-db = {
  "postgresql-server-1" = {
    sql_server_name        = "dev-loverace-pgsql-server"
    resource_group_name    = "loverace-apprg-d01"
    location               = "Central India"
    version                = "12"
    administrator_login    = "loverace"
    administrator_password = "Dhaisabg@1392!"
    firewall_rule          = "allow-access-to-azure-services"
    db_name                = "dev-loverace-pgsql-database"
    storage_mb             = 32768
    sku_name               = "B_Standard_B1ms"
    tags = {
      environment = "dev"
      owner       = "loveraceteam"
      application = "loverace"
      region      = "Central India"
      project     = "loverace"
    }
  }
}

