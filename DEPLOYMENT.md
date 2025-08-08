# Deployment Health Check Configuration

## Overview
The Carnet Healthcare application provides multiple health check endpoints for deployment monitoring and load balancer health checks.

## Available Health Check Endpoints

### Primary Health Check Endpoints
- **`/health`** - Full JSON health status with uptime and timestamp
  - Response: `{"status":"ok","service":"carnet-healthcare","timestamp":"...","uptime":...}`
  - Content-Type: `application/json`

- **`/ping`** - Simple text response 
  - Response: `pong`
  - Content-Type: `text/plain`

- **`/ready`** - Simple readiness check
  - Response: `OK`
  - Content-Type: `text/plain`

### Kubernetes-Style Health Checks
- **`/healthz`** - Kubernetes health check format
  - Response: `{"status":"ok","service":"carnet-healthcare","timestamp":"..."}`
  
- **`/liveness`** - Kubernetes liveness probe
  - Response: `{"status":"ok","alive":true}`
  
- **`/readiness`** - Kubernetes readiness probe
  - Response: `{"status":"ok","ready":true}`

### Additional Endpoints
- **`/status`** - General status endpoint
  - Response: `{"status":"ok","service":"carnet-healthcare","timestamp":"..."}`

- **`/alive`** - Simple alive check
  - Response: `OK`

- **`/deployment-health`** - Explicit deployment health check
  - Response: `{"status":"healthy","service":"carnet-healthcare","deployment":"ready","timestamp":"..."}`

## Deployment Platform Configuration

### Replit Deployments
For Replit deployments, configure the health check endpoint to use:
- **Primary**: `/health` (comprehensive JSON response)
- **Fallback**: `/ping` (simple text response)
- **Ultra-fast**: `/ready` (minimal OK response)

**Important**: Do NOT use the root endpoint (`/`) for health checks in deployment configuration. Always specify one of the dedicated health check endpoints above.

### Docker/Container Deployments
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Kubernetes Deployments
```yaml
livenessProbe:
  httpGet:
    path: /liveness
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /readiness
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Load Balancer Configuration
- **AWS ALB**: Use `/health` for target group health checks
- **NGINX**: Use `/ping` for upstream health checks
- **HAProxy**: Use `/ready` for backend server checks

## Performance Characteristics
- All health check endpoints respond within < 10ms
- No database queries or heavy operations
- Safe to call at high frequency (every few seconds)
- No authentication required

## Root Endpoint Note
The root endpoint (`/`) serves the frontend application and is not suitable for health checks as it:
- Returns HTML content, not JSON
- Takes longer to respond due to frontend loading
- Includes complex JavaScript and CSS assets

Always use the dedicated health check endpoints listed above for deployment monitoring.