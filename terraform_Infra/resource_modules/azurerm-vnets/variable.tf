variable "vnets" {
description = "Map of virtual networks and their subnets"
  type = map(object({
    name                = string
    location            = string
    resource_group_name = string
    address_space       = list(string)
    dns_servers         = optional(list(string), [])
    subnets             = list(object({
      name             = string
      address_prefixes = list(string)
    }))
  }))
}
