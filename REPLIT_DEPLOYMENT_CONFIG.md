# Replit Deployment Configuration

## Health Check Endpoint Configuration

**IMPORTANT**: Configure your Replit deployment to use the dedicated health check endpoint instead of the root path.

### Recommended Configuration

In your Replit deployment settings, set the **Health Check Path** to:

```
/health
```

**DO NOT use `/` (root path)** as it has complex logic that can timeout during deployment health checks.

### Available Health Check Endpoints

- **`/health`** (RECOMMENDED) - Fast JSON response with service status
- **`/ping`** - Ultra-fast plain text response ("pong")
- **`/ready`** - Simple "OK" response
- **`/alive`** - Simple "OK" response
- **`/healthz`** - JSON response (Kubernetes-style)

### Performance Characteristics

All dedicated health check endpoints:
- ✅ Respond in < 5ms
- ✅ No database operations
- ✅ No complex logic or detection
- ✅ Safe for high-frequency health checks
- ✅ No authentication required

### Deployment Settings

Configure your Replit deployment with these settings:

```yaml
# Health Check Configuration
health_check:
  path: "/health"          # Use dedicated endpoint
  timeout: 10              # 10 second timeout (more than enough)
  interval: 30             # Check every 30 seconds
  retries: 3               # Retry 3 times before marking unhealthy
  startup_timeout: 60      # Allow 60 seconds for startup

# Port Configuration
port: 5000                 # Application runs on port 5000

# Environment
environment: production    # Set to production for deployment
```

### Troubleshooting

If health checks still fail:

1. **Verify the health check path** is set to `/health` (not `/`)
2. **Check the timeout settings** - increase if needed (10s should be sufficient)
3. **Test manually** with: `curl https://your-app.replit.app/health`
4. **Check logs** for any startup errors or issues

### Manual Testing

You can test the health check endpoints manually:

```bash
# Test the recommended health endpoint
curl https://your-app.replit.app/health

# Expected response:
{
  "status": "ok",
  "service": "carnet-healthcare", 
  "uptime": 123,
  "timestamp": 1672531200000
}

# Test ultra-fast ping endpoint  
curl https://your-app.replit.app/ping
# Expected: pong
```

## Architecture Changes Made

The following optimizations have been applied:

1. **Simplified root endpoint** - Removed complex detection logic
2. **Dedicated health endpoints** - Fast, lightweight responses
3. **Optimized middleware** - Health checks bypass logging middleware
4. **Non-blocking initialization** - Platform setup happens after server start
5. **Error handling** - Prevents crashes during deployment

These changes ensure deployment health checks complete within timeout limits while maintaining all application functionality.