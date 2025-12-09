# FromScratch Frontend - Docker Deployment Guide

This guide explains how to deploy the FromScratch frontend application using Docker and integrate it with your server's existing Nginx.

## 📋 Prerequisites

- Docker and Docker Compose installed on your server
- Access to your server's main Nginx configuration
- Domain name (optional, for SSL)

## 🚀 Quick Start

### 1. Build and Run with Docker Compose

```bash
# Clone or upload the project to your server
cd /path/to/FromScratch-Frontend-Test

# Create environment file (if needed)
cp .env.example .env
# Edit .env with your configuration

# Build and start the containers
docker-compose up -d

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

The application will be accessible on port **8080** by default (configurable in `docker-compose.yml`).

## 🔗 Integrating with Server's Main Nginx

Your server has its own Nginx running. Here's how to link it with our containerized Nginx:

### Option 1: Reverse Proxy (Recommended)

Configure your server's main Nginx to proxy requests to our containerized application.

Create a new configuration file in your server's Nginx:

**`/etc/nginx/sites-available/fromscratch`**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Optional: Redirect HTTP to HTTPS
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Optional: HTTPS configuration with SSL
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate paths (use Let's Encrypt or your own certificates)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Enable the configuration:**

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/fromscratch /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 2: Subdomain Setup

If you want to host on a subdomain (e.g., app.yourdomain.com):

**`/etc/nginx/sites-available/fromscratch-subdomain`**

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Path-Based Routing

If you want to host on a specific path (e.g., yourdomain.com/app):

```nginx
# Add this to your existing server block
location /app {
    rewrite ^/app(/.*)$ $1 break;
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## 🔒 SSL/HTTPS Setup with Let's Encrypt

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically by certbot
# Test renewal
sudo certbot renew --dry-run
```

## 🛠️ Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

## 📊 Monitoring and Health Checks

### Check Application Health

```bash
# Check if Next.js is running
curl http://localhost:3000

# Check if Nginx container is running
curl http://localhost:8080/health

# Check from outside (through main Nginx)
curl http://yourdomain.com/health
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Next.js logs only
docker-compose logs -f nextjs

# Nginx logs only
docker-compose logs -f nginx

# Nginx access logs
docker exec fromscratch-nginx tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec fromscratch-nginx tail -f /var/log/nginx/error.log
```

## ⚙️ Configuration Options

### Change Exposed Port

Edit `docker-compose.yml`:

```yaml
services:
  nginx:
    ports:
      - "9000:80"  # Change 8080 to any available port
```

### Add Environment Variables

Edit `docker-compose.yml`:

```yaml
services:
  nextjs:
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
      - NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🔧 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Check if port is already in use
sudo netstat -tulpn | grep :8080
```

### Connection refused
```bash
# Verify containers are running
docker-compose ps

# Check network
docker network ls
docker network inspect fromscratch-frontend-test_fromscratch-network
```

### Nginx errors
```bash
# Test nginx configuration
docker exec fromscratch-nginx nginx -t

# Reload nginx
docker exec fromscratch-nginx nginx -s reload
```

## 🚀 Production Best Practices

1. **Use environment variables**: Store sensitive data in `.env` file
2. **Enable SSL**: Always use HTTPS in production
3. **Set up monitoring**: Use tools like Prometheus, Grafana
4. **Regular backups**: Backup your data and configurations
5. **Update regularly**: Keep Docker images and dependencies updated
6. **Resource limits**: Set memory and CPU limits in `docker-compose.yml`

```yaml
services:
  nextjs:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 📝 Architecture Overview

```
Internet
    ↓
Server's Main Nginx (Port 80/443)
    ↓ (proxy to localhost:8080)
Docker Container: fromscratch-nginx (Port 8080)
    ↓ (proxy to nextjs:3000)
Docker Container: fromscratch-frontend (Port 3000)
```

## 🆘 Support

- Check logs: `docker-compose logs -f`
- Verify configuration: `nginx -t`
- Test connectivity: `curl` commands
- Review Docker status: `docker-compose ps`
