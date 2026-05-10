output"acrs-name-id"{
  value= {for key in azurerm_container_registry.acrs : key.name =>key.id}
}