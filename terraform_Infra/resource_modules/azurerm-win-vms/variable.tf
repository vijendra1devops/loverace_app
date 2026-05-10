variable "window-vms" {
   description = "Map of Windows virtual machines and their configurations"
  type = map(object({
    vm_name                      = string
    location                     = string
    resource_group_name          = string
    size                         = string
    allocation_method            = optional(string,)
    private_ip_address_allocation = optional(string, )

    caching                      = optional(string, "ReadWrite")
    storage_account_type         = optional(string, "Standard_LRS")

    publisher                    = string
    offer                        = string
    sku                          = string
    version                      = string

    subnet_name                  = string
    virtual_network_name         = string
    nsg_name                     = string
    # asgs_name                  = string  # Uncomment if using ASG

    kv_name                      = string
  }))
}
