// ── Virtual Network + Subnets ─────────────────────────────────────────────────
param location string
param appName string
param env string

var prefix = '${appName}-${env}'

resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: 'vnet-${prefix}'
  location: location
  properties: {
    addressSpace: { addressPrefixes: ['10.0.0.0/16'] }
    subnets: [
      {
        name: 'snet-aks'
        properties: {
          addressPrefix: '10.0.0.0/22'    // 1022 IPs for AKS nodes/pods
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: 'snet-pg'
        properties: {
          addressPrefix: '10.0.4.0/28'    // PostgreSQL Flexible Server delegated subnet
          delegations: [
            {
              name: 'pg-delegation'
              properties: { serviceName: 'Microsoft.DBforPostgreSQL/flexibleServers' }
            }
          ]
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: 'snet-appgw'
        properties: { addressPrefix: '10.0.5.0/27' }   // Application Gateway
      }
    ]
  }
}

// Private DNS zone for PostgreSQL Flexible Server
resource pgDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: '${prefix}.private.postgres.database.azure.com'
  location: 'global'
}

resource pgDnsLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: pgDnsZone
  name: 'pg-dns-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnet.id }
    registrationEnabled: false
  }
}

output vnetId string = vnet.id
output aksSubnetId string = '${vnet.id}/subnets/snet-aks'
output pgSubnetId string = '${vnet.id}/subnets/snet-pg'
output appGwSubnetId string = '${vnet.id}/subnets/snet-appgw'
output pgPrivateDnsZoneId string = pgDnsZone.id
