variable "acr" {
description = "A map of ACR configurations where the key is the ACR name and the value contains its properties."
  type = map(object({
    name                = string  # ACR name
    resource_group_name = string  # Name of the resource group
    location            = string  # Location of the ACR
    sku                 = string  # SKU of the ACR
    tags = optional(map(string))
  }))
}
