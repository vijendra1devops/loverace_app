variable "nsgs" {
  description = "Map of NSGs with their properties and security rules"
  type = map(object({
    name                = string
    location            = string
    resource_group_name = string

    security_rules = list(object({
      name                       = string
      priority                   = number
      direction                  = string         # "Inbound" or "Outbound"
      access                     = string         # "Allow" or "Deny"
      protocol                   = string         # "Tcp", "Udp", "*"
      source_port_range          = string
      destination_port_range     = string
      source_address_prefix      = string
      destination_address_prefix = string
    }))
  }))
}
