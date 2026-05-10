terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.38.0"
    }
    # random = {
    #   source  = "hashicorp/random"
    #   version = "4.38.0"
    # }
     }
   backend "azurerm" {
      resource_group_name  = "backend-rg"          # Can be passed via `-backend-config=`"resource_group_name=<resource group name>"` in the `init` command.
      storage_account_name = "devbackendstg"                # Can be passed via `-backend-config=`"storage_account_name=<storage account name>"` in the `init` command.
      container_name       = "my-backend-cnt"                         # Can be passed via `-backend-config=`"container_name=<container name>"` in the `init` command.
      key                  = "terraform.tfstate"                # Can be passed via `-backend-config=`"key=<blob key name>"` in the `init` command.
    }

}


provider "azurerm" {
  features {}
  subscription_id = var.ARM_SUBSCRIPTION_ID
}

# provider "random" {}

