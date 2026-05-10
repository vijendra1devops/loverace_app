# Infrastructure requirements — Azure

This document captures recommended infrastructure requirements and design notes for the Loverace application.

Scope
- Cloud: Microsoft Azure
- Database: Azure Database for PostgreSQL - Flexible Server ("Postgres Flexible")
- UI: Azure App Service (Linux) for the React frontend
- Backend: Azure Kubernetes Service (AKS) for the API and services

Assumptions
- Single primary region (choose region early — e.g., `eastus`, `westeurope`).
- Separate environments: `dev`, `staging`, `prod` (distinct Resource Groups and naming).
- Production expected to require HA, monitoring and automated backups; dev can use smaller SKUs.

High-level architecture
- Resource Group per environment (eg. `loverace-rg-prod`).
- VNet with dedicated subnets:
  - `aks-subnet` — AKS node pools
  - `appsvc-integration-subnet` — App Service regional VNet Integration (outbound)
  - `private-endpoint-subnet` — private endpoints (Postgres, Key Vault, ACR if needed)
- Private networking: Postgres Flexible Server should be accessed via Private Endpoint (Private Link).
- Ingress: prefer Application Gateway (WAF) + AGIC for AKS, or NGINX ingress controller + Azure Load Balancer. Front door/CDN optional.
- Centralized secrets: Azure Key Vault, accessed by managed identities (AKS, App Service).
- Container images stored in Azure Container Registry (ACR) with RBAC for AKS and CI.

Core resources & recommended settings

1) Azure Database for PostgreSQL — Flexible Server
- Purpose: primary relational store. Use Flexible Server for control over availability, maintenance windows and private networking.
- Production recommendation:
  - SKU: General Purpose (e.g., `Standard_D4s_v3`) — 4 vCores (adjust to load)
  - Storage: start at 100 GB (SSD)
  - Backup / PITR: enabled, retention 7–35 days depending on RPO
  - High availability: enable zone-redundant HA if required
  - Networking: restrict public access; create a Private Endpoint in `private-endpoint-subnet`
  - Security: enforce TLS, use Azure AD auth where possible, set `sslmode=require` on clients
  - Connection pooling: use PgBouncer (deployed in AKS) for high-concurrency workloads
  - Monitoring: enable diagnostic logs to Log Analytics and set alerts for CPU, storage, connections

DEV example:
- SKU: Burstable / 1–2 vCores, storage 20–50 GB

Environment variables (example):
```
DB_HOST=loverace-db.privatelink.postgres.database.azure.com
DB_PORT=5432
DB_NAME=loverace
DB_USER=loverace_admin
DB_PASSWORD=<from Key Vault>
DATABASE_URL=postgres://loverace_admin:...@loverace-db:5432/loverace
```

Secrets: never store DB credentials in code — use Azure Key Vault and assign access via Managed Identity.

2) Azure App Service (UI)
- Purpose: serve the React frontend build (static assets or container)
- Recommendation:
  - Use Linux App Service or optional Container-based App Service (for consistent runtime)
  - App Service Plan: `S1` or `P1v2` for production (scale-out via instance count); `B1` / `S1` for staging/dev
  - Deployment: build frontend in CI (GitHub Actions), either zip-deploy static build or push container image to ACR and point App Service to the image.
  - VNet Integration: enable Regional VNet Integration so App Service can reach private backends (AKS API gateway or Postgres private endpoint) outbound
  - App settings: set `REACT_APP_API_URL`, `NODE_ENV`, and any feature flags as App Settings (store secrets in Key Vault)
  - Custom domain + TLS: use App Service managed certs or import certificate via Key Vault
  - Monitoring: link to Application Insights and enable HTTP logging
  - Use deployment slots for zero-downtime deploys (staging slot)

3) AKS (backend)
- Purpose: run API, workers and background jobs in containers
- Cluster config recommendations:
  - Managed AKS cluster with RBAC and Azure AD integration
  - Network plugin: Azure CNI (recommended for VNet integration & private endpoints)
  - Node pools: separate system and workload pools
    - system pool: Standard_D2s_v3, 3 nodes
    - workload pool(s): Standard_D4s_v3 (or size based on CPU/memory), auto-scale enabled
  - Autoscaling: enable Cluster Autoscaler and use Kubernetes HPA for pods
  - Private cluster: consider private API server and private endpoints for improved security
  - Ingress: Application Gateway (AGIC) or NGINX — prefer AGIC if you want native WAF + Azure integration
  - Storage: use Azure Disk for block storage, Azure Files for shared volumes
  - Image registry: ACR with role assignment for AKS to pull images
  - Secrets and config: use Secrets Store CSI driver with Azure Key Vault provider to keep secrets out of k8s manifests
  - Migrations: Use Kubernetes Job/Helm hook or CI step to run DB migrations

Networking & Security
- Use a single VNet per environment with subnet isolation and NSGs.
- Put Private Endpoints for Postgres and Key Vault in the `private-endpoint-subnet` and lock down the Postgres to only that subnet.
- Use NSGs to prevent direct internet access to AKS nodes; publicly expose only the ingress endpoint.
- Enable Azure Policy for resource governance (tagging, SKU limits, required diagnostics).
- Use Managed Identities rather than client secrets where possible. Use GitHub OIDC for CI to request short-lived credentials.
- Container image scanning: enable ACR Tasks to scan images or integrate third-party scanner.

CI / CD
- Use GitHub Actions (or Azure DevOps):
  - Frontend pipeline: build -> test -> upload artifact -> deploy to App Service (zip or container)
  - Backend pipeline: build -> test -> build container -> push to ACR -> deploy to AKS via `kubectl`/`helm`
  - Run DB migrations in a controlled job step (example: a Helm `pre-upgrade` job or a pipeline job that uses `kubectl run` to execute migration container)
  - Use GitHub OIDC to grant the pipeline access to Azure resources (no long-lived service principal required)

Observability and Monitoring
- Application Insights for both frontend and backend (correlate traces via operation id)
- Container Insights / Log Analytics for AKS
- Prometheus + Grafana if you need custom metrics (AKS)
- Alerts: set thresholds for DB storage %, CPU, pod restarts, 5xx rates

Backup & Disaster Recovery
- Postgres: rely on Flexible Server PITR and automated backups. Define retention per RPO.
- Regularly test restores to a staging cluster.
- Consider cross-region read replicas or geo-backup for critical DR scenarios.

Governance & policies
- Tag all resources (`env`, `team`, `project`, `cost-center`).
- Use Azure Policy to enforce encryption, logging and naming conventions.
- Centralize logs into one Log Analytics workspace per environment with retained logs based on compliance needs.

Cost & sizing guidance
- Start with conservative production sizes and scale after metrics collection:
  - Postgres: `Standard_D4s_v3`, 100 GB (General Purpose)
  - AKS nodes: Standard_D2s_v3 (smaller) or Standard_D4s_v3 for production workloads
  - App Service Plan: `S1` / `P1v2`
- Re-evaluate after collecting real usage metrics for 2–4 weeks.

Terraform / IaC recommendations
- Manage infra with Terraform modules, separate state per environment.
- Key modules: `resource_group`, `vnet`, `postgresql_flexible_server`, `azure_kubernetes_service`, `app_service`, `container_registry`, `key_vault`, `application_gateway`.

Minimal Terraform snippet (illustrative — adapt versions and provider config):
```hcl
resource "azurerm_resource_group" "rg" {
  name     = "loverace-rg-prod"
  location = var.location
}

resource "azurerm_postgresql_flexible_server" "db" {
  name                = "loverace-db-prod"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  administrator_login          = var.db_admin
  administrator_password       = var.db_admin_password
  sku_name            = "Standard_D4s_v3"
  storage_mb          = 102400
  version             = "14"
  delegated_subnet_id = azurerm_subnet.postgres_delegated.id
}
```

Operational checklist (pre-launch)
- Choose region and set naming/tags convention.
- Provision RG, VNet and subnets.
- Provision Postgres Flexible with Private Endpoint.
- Provision AKS with network plugin and node pools.
- Provision ACR and configure CI to push images.
- Provision App Service and wire CI to deploy frontend.
- Configure Key Vault and grant managed identities access.
- Configure monitoring: App Insights + Log Analytics + alerts.
- Test DB backups & restores and run end-to-end smoke tests.

Next steps / questions
- Which Azure region should we target for prod?
- Expected baseline capacity: estimated concurrent users / RPS?
- Confirm whether App Service (PaaS) is preferred over Static Web Apps or Azure CDN-managed hosting for the frontend.
- Do you want Terraform templates and GitHub Actions examples committed to this repo? I can scaffold them if you want.

---
Document created: infra.md — will be the baseline specification for provisioning Loverace infra on Azure using Postgres Flexible Server, App Service and AKS.
