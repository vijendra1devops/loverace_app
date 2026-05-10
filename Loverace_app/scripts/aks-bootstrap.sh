#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/aks-bootstrap.sh
#
# One-time cluster setup AFTER the Bicep deployment completes.
# Run this locally once; subsequent deploys are handled by GitHub Actions.
#
# Usage:
#   export SUBSCRIPTION_ID=<your-sub-id>
#   export TENANT_ID=<your-tenant-id>
#   export RG=rg-loverace-prod
#   export AKS=aks-loverace-prod
#   export KV=kv-loverace-prod
#   bash scripts/aks-bootstrap.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

: "${SUBSCRIPTION_ID:?Set SUBSCRIPTION_ID}"
: "${TENANT_ID:?Set TENANT_ID}"
: "${RG:?Set RG}"
: "${AKS:?Set AKS}"
: "${KV:?Set KV}"

echo "▶  Setting subscription"
az account set --subscription "$SUBSCRIPTION_ID"

echo "▶  Fetching AKS credentials"
az aks get-credentials --resource-group "$RG" --name "$AKS" --overwrite-existing

echo "▶  Enabling Key Vault Secrets Provider add-on (idempotent)"
az aks enable-addons \
  --resource-group "$RG" \
  --name "$AKS" \
  --addons azure-keyvault-secrets-provider \
  --enable-secret-rotation \
  --rotation-poll-interval 2m

echo "▶  Installing cert-manager"
helm repo add jetstack https://charts.jetstack.io --force-update
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set installCRDs=true \
  --set global.leaderElection.namespace=cert-manager \
  --wait

echo "▶  Applying namespace"
kubectl apply -f infra/k8s/namespace.yaml

echo "▶  Applying Key Vault CSI SecretProviderClass"
# Inject the real Tenant ID into the YAML before applying
sed "s/<TENANT_ID>/$TENANT_ID/g" infra/k8s/keyvault-csi.yaml \
  | sed "s/kv-loverace-prod/$KV/g" \
  | kubectl apply -f -

echo "▶  Applying cert-manager ClusterIssuer"
kubectl apply -f infra/k8s/cert-issuer.yaml

echo "▶  Applying ingress"
kubectl apply -f infra/k8s/ingress.yaml

echo "▶  Applying backend manifests"
kubectl apply -f services/core_api/k8s/configmap.yaml
kubectl apply -f services/core_api/k8s/deployment.yaml
kubectl apply -f services/core_api/k8s/service.yaml
kubectl apply -f services/core_api/k8s/hpa.yaml

kubectl apply -f services/realtime_gateway/k8s/configmap.yaml
kubectl apply -f services/realtime_gateway/k8s/deployment.yaml
kubectl apply -f services/realtime_gateway/k8s/service.yaml
kubectl apply -f services/realtime_gateway/k8s/hpa.yaml

echo "▶  Waiting for rollouts"
kubectl rollout status deployment/core-api -n loverace --timeout=180s
kubectl rollout status deployment/realtime-gateway -n loverace --timeout=180s

echo "✅  Cluster bootstrap complete"
echo "   Next steps:"
echo "   1. Get App Gateway public IP and point api.loverace.app DNS to it"
echo "   2. Push code to main branch — GitHub Actions will deploy on every commit"
