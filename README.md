# FromScratch Frontend - Docker Deployment

This is the deployment folder for the FromScratch frontend application.

## 📁 Structure

```
deployment/
├── docker-compose.yml          # Main orchestration file
├── nginx/
│   └── nginx.conf             # Nginx configuration
├── frontend/                   # Your Next.js app (copy entire project here)
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   └── ...
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🚀 Deployment Steps

### 1. Copy Your Frontend App

Copy the entire frontend project into the `frontend/` directory:

```bash
# On Windows (PowerShell)
Copy-Item -Path "c:\Users\dell\Desktop\FromScratch-Frontend-Test\*" -Destination "c:\Users\dell\Desktop\FromScratch-Frontend-Test\deployment\frontend\" -Recurse -Exclude "deployment"

# Or manually copy all project files (except the deployment folder) to deployment/frontend/
```

### 2. Configure Environment

```bash
cd deployment
copy .env.example .env
# Edit .env with your configuration
```

### 3. Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Configure Server Nginx

On your server, create `/etc/nginx/sites-available/fromscratch`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/fromscratch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild after changes
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f nextjs
docker-compose logs -f nginx
```

## 🔧 Troubleshooting

```bash
# Check container status
docker-compose ps

# Check logs for errors
docker-compose logs

# Restart a specific service
docker-compose restart nextjs

# Remove and rebuild everything
docker-compose down
docker-compose up -d --build
```

## 📝 Notes

- The application runs on port 8080 by default (configurable in docker-compose.yml)
- Logs are stored in a Docker volume named `nginx-logs`
- The frontend container exposes port 3000 internally only
- All services communicate through the `fromscratch-network` bridge network
