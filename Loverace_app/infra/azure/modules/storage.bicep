// ── Azure Blob Storage (replaces MinIO / S3) ──────────────────────────────────
param location string
param appName string
param env string

var accountName = replace('st${appName}${env}', '-', '')

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: accountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    encryption: {
      services: {
        blob: { enabled: true }
        file: { enabled: true }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  name: '${storage.name}/default/media'
  properties: { publicAccess: 'None' }
}

output accountName string = storage.name
output primaryKey string = storage.listKeys().keys[0].value
output blobEndpoint string = storage.properties.primaryEndpoints.blob
