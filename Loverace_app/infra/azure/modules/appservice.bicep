// ── Azure App Service (Frontend — Docker container from ACR) ──────────────────
param location string
param appName string
param env string

// Runtime config baked into the container at CI build time — passed here as
// App Service app settings so they show up in the portal for reference.
param apiUrl string
param wsUrl string

// ACR credentials for App Service to pull the image
param acrLoginServer string
param acrAdminUsername string
@secure()
param acrAdminPassword string

var planName = 'plan-${appName}-${env}'
var webAppName = '${appName}-${env}'

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  sku: { name: 'B1', tier: 'Basic' }      // upgrade to P1v3 for prod
  kind: 'linux'
  properties: { reserved: true }           // required for Linux containers
}

resource webapp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${appName}/frontend:latest'
      alwaysOn: true
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      healthCheckPath: '/health'
      appSettings: [
        { name: 'DOCKER_REGISTRY_SERVER_URL',      value: 'https://${acrLoginServer}' }
        { name: 'DOCKER_REGISTRY_SERVER_USERNAME', value: acrAdminUsername }
        { name: 'DOCKER_REGISTRY_SERVER_PASSWORD', value: acrAdminPassword }
        // Informational — actual values are baked in at docker build time
        { name: 'VITE_API_URL',                    value: apiUrl }
        { name: 'VITE_WS_URL',                     value: wsUrl }
        { name: 'WEBSITES_PORT',                   value: '80' }
        // Continuous deployment webhook from ACR
        { name: 'DOCKER_ENABLE_CI',                value: 'true' }
      ]
    }
    httpsOnly: true
  }
}

// Enable container logging
resource logs 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: webapp
  name: 'logs'
  properties: {
    applicationLogs: { fileSystem: { level: 'Warning' } }
    httpLogs: { fileSystem: { retentionInDays: 3, enabled: true } }
    detailedErrorMessages: { enabled: false }
  }
}

output defaultHostname string = webapp.properties.defaultHostName
output webAppName string = webapp.name
