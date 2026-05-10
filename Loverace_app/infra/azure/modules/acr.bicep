// ── Azure Container Registry ──────────────────────────────────────────────────
param location string
param appName string
param env string

var acrName = replace('acr${appName}${env}', '-', '')   // ACR names: alphanumeric only

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: { name: 'Basic' }      // upgrade to Standard/Premium for geo-replication
  properties: {
    adminUserEnabled: true     // needed for App Service "Docker Container" pull
    anonymousPullEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

output acrId string = acr.id
output loginServer string = acr.properties.loginServer
output adminUsername string = acr.listCredentials().username
output adminPassword string = acr.listCredentials().passwords[0].value
