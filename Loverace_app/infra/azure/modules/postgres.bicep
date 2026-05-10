// ── Azure Database for PostgreSQL Flexible Server ─────────────────────────────
param location string
param appName string
param env string
param adminLogin string
@secure()
param adminPassword string
param delegatedSubnetId string
param privateDnsZoneId string

resource pg 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: 'pg-${appName}-${env}'
  location: location
  sku: {
    name: 'Standard_B2ms'    // 2 vCores, 8 GB — upgrade to D4s_v3 for prod load
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: adminLogin
    administratorLoginPassword: adminPassword
    version: '15'
    storage: { storageSizeGB: 32 }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: { mode: 'Disabled' }  // enable ZoneRedundant for prod HA
    network: {
      delegatedSubnetResourceId: delegatedSubnetId
      privateDnsZoneArmResourceId: privateDnsZoneId
    }
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
  }
}

// Create the loverace database
resource db 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: pg
  name: 'loverace'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.UTF8'
  }
}

// Enable PostGIS extension
resource postgisConfig 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2023-12-01-preview' = {
  parent: pg
  name: 'azure.extensions'
  properties: {
    value: 'POSTGIS,UUID-OSSP'
    source: 'user-override'
  }
}

output fqdn string = pg.properties.fullyQualifiedDomainName
output serverId string = pg.id
