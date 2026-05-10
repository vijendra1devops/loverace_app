// ── Azure Key Vault + secrets ─────────────────────────────────────────────────
param location string
param appName string
param env string

// Who should have admin rights (your team / pipeline SP object ID)
param adminObjectId string

// AKS Workload Identity / kubelet identity
param aksOidcIssuer string
param aksManagedIdentityPrincipalId string

// Secret values (passed securely from main.bicep / pipeline)
param pgHost string
param pgAdminUser string
@secure()
param pgAdminPassword string
@secure()
param jwtSecret string
param storageAccountName string
@secure()
param storageKey string

var vaultName = 'kv-${appName}-${env}'

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: vaultName
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true      // use RBAC, not access policies
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enablePurgeProtection: env == 'prod' ? true : false
    publicNetworkAccess: 'Enabled'     // restrict to VNet for prod hardening
  }
}

// Admin gets Key Vault Administrator role
resource kvAdminRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(kv.id, adminObjectId, 'KVAdmin')
  scope: kv
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '00482a5a-887f-4fb3-b363-3b7fe8e74483') // Key Vault Administrator
    principalId: adminObjectId
    principalType: 'User'
  }
}

// AKS kubelet identity gets Key Vault Secrets User role
resource kvSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(kv.id, aksManagedIdentityPrincipalId, 'KVSecretsUser')
  scope: kv
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: aksManagedIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// ── Secrets ───────────────────────────────────────────────────────────────────
var dbUrl = 'postgresql+asyncpg://${pgAdminUser}:${pgAdminPassword}@${pgHost}/loverace?ssl=require'
var asyncpgUrl = 'postgresql://${pgAdminUser}:${pgAdminPassword}@${pgHost}/loverace?ssl=require'

resource secretDatabaseUrl 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'DATABASE-URL'
  properties: { value: dbUrl }
}

resource secretAsyncpgUrl 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'ASYNCPG-URL'
  properties: { value: asyncpgUrl }
}

resource secretJwt 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'JWT-SECRET'
  properties: { value: jwtSecret }
}

resource secretStorageKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'STORAGE-KEY'
  properties: { value: storageKey }
}

resource secretStorageName 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: kv
  name: 'STORAGE-ACCOUNT-NAME'
  properties: { value: storageAccountName }
}

output vaultName string = kv.name
output vaultUri string = kv.properties.vaultUri
