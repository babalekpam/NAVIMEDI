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
- **PRIMARY RECOMMENDED**: `/health` (fast JSON response, < 5ms)
- **Ultra-fast alternative**: `/ping` (plain text "pong" response)
- **Simple alternative**: `/ready` (plain text "OK" response)

**CRITICAL**: Set your deployment health check path to `/health` in Replit deployment settings.
**DO NOT use `/` (root path)** - it has been simplified but `/health` is optimized specifically for deployment health checks.

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

## Root Endpoint Optimization
✅ **OPTIMIZED**: The root endpoint (`/`) has been simplified for better deployment compatibility:
- **For basic health checks**: Returns immediate JSON health status (< 5ms)
- **For browsers**: Serves the frontend React application
- **Simple detection**: Minimal User-Agent checking to avoid complex logic
- **Recommendation**: Use dedicated `/health` endpoint for deployment health checks

✅ **NEW**: Dedicated `/health` endpoint provides optimal deployment health checking:
- **Ultra-fast response**: < 5ms response time
- **No complex logic**: Direct status response without detection overhead
- **Production optimized**: Bypasses logging and middleware for maximum performance

## Deployment Troubleshooting

### "Health check failing because the application isn't responding to the / endpoint"
This error occurs when the deployment system is configured to use the root endpoint (`/`) for health checks. 

**Solution**: Configure your deployment to use a dedicated health check endpoint instead:
- For fastest response: `/ready` or `/ping`
- For detailed status: `/health` or `/deployment-health`

**Example configurations:**
- Replit: Change health check path from `/` to `/health`
- Docker healthcheck: `curl -f http://localhost:5000/ready`
- Load balancer: Point health checks to `/ping` instead of `/`