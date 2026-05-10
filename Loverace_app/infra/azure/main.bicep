// ─────────────────────────────────────────────────────────────────────────────
// Loverace – Azure Infrastructure (main.bicep)
//
// Deploy:
//   az deployment sub create \
//     --name loverace-infra \
//     --location eastus \
//     --template-file infra/azure/main.bicep \
//     --parameters @infra/azure/parameters.json
// ─────────────────────────────────────────────────────────────────────────────

targetScope = 'subscription'

@description('Azure region for all resources')
param location string = 'eastus'

@description('Short environment name: dev | staging | prod')
@allowed(['dev', 'staging', 'prod'])
param env string = 'prod'

@description('Base name used for all resources (e.g. loverace)')
param appName string = 'loverace'

@description('PostgreSQL administrator login')
param pgAdminUser string = 'lovraceadmin'

@secure()
@description('PostgreSQL administrator password')
param pgAdminPassword string

@secure()
@description('JWT secret (≥32 chars)')
param jwtSecret string

@description('Azure AD Object ID of the team/pipeline that should be KV admin')
param kvAdminObjectId string

@description('CORS origin for the frontend App Service (e.g. https://loverace.app)')
param frontendOrigin string = 'https://${appName}.azurewebsites.net'

// ── Resource group ────────────────────────────────────────────────────────────
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: 'rg-${appName}-${env}'
  location: location
}

// ── Modules ───────────────────────────────────────────────────────────────────
module vnet 'modules/vnet.bicep' = {
  name: 'vnet'
  scope: rg
  params: { location: location, appName: appName, env: env }
}

module acr 'modules/acr.bicep' = {
  name: 'acr'
  scope: rg
  params: { location: location, appName: appName, env: env }
}

module aks 'modules/aks.bicep' = {
  name: 'aks'
  scope: rg
  params: {
    location: location
    appName: appName
    env: env
    aksSubnetId: vnet.outputs.aksSubnetId
    acrId: acr.outputs.acrId
  }
}

module postgres 'modules/postgres.bicep' = {
  name: 'postgres'
  scope: rg
  params: {
    location: location
    appName: appName
    env: env
    adminLogin: pgAdminUser
    adminPassword: pgAdminPassword
    delegatedSubnetId: vnet.outputs.pgSubnetId
    privateDnsZoneId: vnet.outputs.pgPrivateDnsZoneId
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  scope: rg
  params: { location: location, appName: appName, env: env }
}

module keyvault 'modules/keyvault.bicep' = {
  name: 'keyvault'
  scope: rg
  params: {
    location: location
    appName: appName
    env: env
    adminObjectId: kvAdminObjectId
    aksOidcIssuer: aks.outputs.oidcIssuer
    aksManagedIdentityPrincipalId: aks.outputs.kubeletPrincipalId
    pgHost: postgres.outputs.fqdn
    pgAdminUser: pgAdminUser
    pgAdminPassword: pgAdminPassword
    jwtSecret: jwtSecret
    storageAccountName: storage.outputs.accountName
    storageKey: storage.outputs.primaryKey
  }
}

module appservice 'modules/appservice.bicep' = {
  name: 'appservice'
  scope: rg
  params: {
    location: location
    appName: appName
    env: env
    apiUrl: 'https://api.${appName}.app'
    wsUrl: 'wss://api.${appName}.app'
    acrLoginServer: acr.outputs.loginServer
    acrAdminUsername: acr.outputs.adminUsername
    acrAdminPassword: acr.outputs.adminPassword
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output resourceGroupName string = rg.name
output acrLoginServer string = acr.outputs.loginServer
output aksName string = aks.outputs.clusterName
output appServiceUrl string = appservice.outputs.defaultHostname
output postgresHost string = postgres.outputs.fqdn
output keyVaultName string = keyvault.outputs.vaultName
