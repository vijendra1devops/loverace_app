// ── AKS Cluster ───────────────────────────────────────────────────────────────
param location string
param appName string
param env string
param aksSubnetId string
param acrId string

var clusterName = 'aks-${appName}-${env}'

// System-assigned identity for the cluster
resource aks 'Microsoft.ContainerService/managedClusters@2024-02-01' = {
  name: clusterName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    dnsPrefix: '${appName}-${env}'

    // OIDC issuer + Workload Identity (needed for Key Vault CSI)
    oidcIssuerProfile: { enabled: true }
    securityProfile: { workloadIdentity: { enabled: true } }

    agentPoolProfiles: [
      {
        name: 'system'
        count: 1
        vmSize: 'Standard_D2s_v3'
        osType: 'Linux'
        mode: 'System'
        vnetSubnetID: aksSubnetId
        enableAutoScaling: true
        minCount: 1
        maxCount: 3
      }
      {
        name: 'backend'
        count: 2
        vmSize: 'Standard_D2s_v3'
        osType: 'Linux'
        mode: 'User'
        vnetSubnetID: aksSubnetId
        enableAutoScaling: true
        minCount: 2
        maxCount: 10
        nodeTaints: []
        nodeLabels: { role: 'backend' }
      }
    ]

    networkProfile: {
      networkPlugin: 'azure'
      networkPolicy: 'azure'
      serviceCidr: '10.1.0.0/16'
      dnsServiceIP: '10.1.0.10'
      loadBalancerSku: 'Standard'
    }

    // Enable Application Gateway Ingress Controller add-on
    addonProfiles: {
      ingressApplicationGateway: {
        enabled: true
        config: {
          subnetCIDR: '10.0.5.0/27'
        }
      }
      azureKeyvaultSecretsProvider: {
        enabled: true
      }
    }

    // Enable Azure Key Vault Secrets Store CSI Driver
    // (deployed automatically via add-on)
    storageProfile: {
      diskCSIDriver: { enabled: true }
      fileCSIDriver: { enabled: true }
      snapshotController: { enabled: false }
    }
  }
}

// Grant AKS kubelet identity AcrPull on the ACR
resource acrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acrId, aks.id, 'AcrPull')
  scope: resourceGroup()
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalId: aks.properties.identityProfile.kubeletidentity.objectId
    principalType: 'ServicePrincipal'
  }
}

// Enable Secrets Store CSI driver add-on (preview API)
resource csiAddon 'Microsoft.ContainerService/managedClusters/extensions@2024-02-01' = if (false) {
  // Placeholder — CSI add-on is enabled via az aks enable-addons
  // or via the storageProfile above; no Bicep resource needed.
  name: 'placeholder'
  parent: aks
}

output clusterName string = aks.name
output oidcIssuer string = aks.properties.oidcIssuerProfile.issuerURL
output kubeletPrincipalId string = aks.properties.identityProfile.kubeletidentity.objectId
output controlPlanePrincipalId string = aks.identity.principalId
