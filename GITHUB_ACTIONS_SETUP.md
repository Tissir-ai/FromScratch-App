# GitHub Actions Setup - No Root Access Required!

## Why GitHub Actions?
✅ No installation needed on server  
✅ Runs on GitHub's infrastructure  
✅ Only needs SSH access to your server  
✅ Free for public repos  
✅ Easier than Jenkins  

---

## Step-by-Step Setup

### Step 1: Generate SSH Key on Your Local Machine

```bash
# On your local computer (Windows/PowerShell or Git Bash)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f github-actions-key

# This creates 2 files:
# - github-actions-key (private key - keep secret!)
# - github-actions-key.pub (public key - put on server)
```

### Step 2: Add Public Key to Server

**Option A: If you have SSH access:**
```bash
# Copy the public key content
cat github-actions-key.pub

# SSH to server
ssh your-user@your-server-ip

# Add the public key
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Option B: Ask server admin to add this to your user's authorized_keys:**
Send them the content of `github-actions-key.pub`

### Step 3: Add Secrets to GitHub Repository

1. Go to your GitHub repo: https://github.com/Tissir-ai/FromScratch-App
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Add these secrets one by one:

| Name | Value | YOUR ACTUAL VALUE |
|------|-------|-------------------|
| `SERVER_HOST` | Server IP address | `109.123.248.72` |
| `SERVER_USER` | Your SSH username | `admintissirai` |
| `SERVER_PORT` | SSH port | `22` |
| `SSH_PRIVATE_KEY` | Content of `github-actions-key` file | (see instructions below) |
| `PROJECT_PATH` | Full path to project on server | `/srv/teams/TissirAi/FromScratch-App` |

**To add each secret:**
- Click **New repository secret**
- Name: (from table above)
- Secret: (value from YOUR ACTUAL VALUE column)
- Click **Add secret**

**For `SSH_PRIVATE_KEY`:**
On your local machine, run:
```bash
cat github-actions-key
```
Copy EVERYTHING including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
... all the content ...
-----END OPENSSH PRIVATE KEY-----
```
Paste this entire content as the secret value.

### Step 4: Move Workflow File to Correct Location

The workflow file needs to be in your **repository root**, not in deployment folder:

```bash
# On your local machine, in your project root
mkdir -p .github/workflows
mv deployment/.github/workflows/deploy.yml .github/workflows/deploy.yml

# Or create it directly:
# .github/workflows/deploy.yml
```

### Step 5: Commit and Push

```bash
# Add the workflow file
git add .github/workflows/deploy.yml

# Commit
git commit -m "Add GitHub Actions deployment"

# Push to GitHub
git push origin main
```

### Step 6: Check the Action

1. Go to your GitHub repo
2. Click **Actions** tab (top menu)
3. You should see your workflow running
4. Click on it to see the progress
5. Wait for it to complete (green checkmark = success)

---

## How to Test

### Test 1: Check the Action Ran
1. Go to GitHub repo → **Actions** tab
2. You should see "Deploy to Server" workflow
3. Click on the latest run
4. Check all steps are green ✓

### Test 2: Make a Change and Push
```bash
# Edit any file
echo "# Test GitHub Actions" >> README.md

# Commit and push
git add README.md
git commit -m "Test auto-deploy with GitHub Actions"
git push origin main
```

**Result:** Within 10-30 seconds:
- GitHub Actions starts automatically
- Connects to your server via SSH
- Pulls latest code
- Rebuilds and restarts containers

### Test 3: Verify on Server
```bash
# SSH to server
ssh your-user@your-server-ip

# Check containers
docker compose -f /path/to/deployment/docker-compose.yml ps

# Check logs
docker compose -f /path/to/deployment/docker-compose.yml logs --tail=20
```

---

## Troubleshooting

### Error: "Permission denied (publickey)"
**Solution:** Public key not added to server correctly
```bash
# On server, check authorized_keys
cat ~/.ssh/authorized_keys

# Should contain the public key from github-actions-key.pub
```

### Error: "Repository not found" or "Permission denied" for git pull
**Solution:** Add deploy key to GitHub or use HTTPS
```bash
# On server, set up git credentials or use HTTPS
cd /path/to/project
git remote set-url origin https://github.com/Tissir-ai/FromScratch-App.git
```

### Error: "docker compose not found"
**Solution:** Use docker-compose with dash
- Edit `.github/workflows/deploy.yml`
- Replace `docker compose` with `docker-compose`

### Error: "Permission denied" for docker commands
**Solution:** Add your user to docker group (need admin help)
```bash
# Ask admin to run:
sudo usermod -aG docker YOUR_USERNAME
# Then logout and login again
```

---

## What Happens on Every Push

```
1. You push code to GitHub (main branch)
   ↓
2. GitHub Actions triggers automatically
   ↓
3. GitHub's server connects to your server via SSH
   ↓
4. Pulls latest code (git pull)
   ↓
5. Pulls Docker images (docker compose pull)
   ↓
6. Builds new images (docker compose build)
   ↓
7. Restarts containers (docker compose up -d)
   ↓
8. Shows running containers
   ↓
9. ✅ Done! Your app is updated
```

---

## Advantages vs Jenkins

| Feature | GitHub Actions | Jenkins |
|---------|---------------|---------|
| Installation | ❌ None needed | ✅ Requires root access |
| Setup time | 🟢 5-10 minutes | 🔴 30-60 minutes |
| Maintenance | 🟢 GitHub handles it | 🔴 You maintain it |
| Cost | 🟢 Free (public repos) | 🟢 Free but uses server resources |
| Security | 🟢 Runs on GitHub | 🔴 Opens port 8080 |

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit your private SSH key to Git
- Keep `github-actions-key` file safe on your local machine
- Only add the **.pub** file to the server
- Use different SSH keys for different purposes

---

## Complete Workflow File

Here's the full `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Deploy to server via SSH
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        port: ${{ secrets.SERVER_PORT }}
        script: |
          cd ${{ secrets.PROJECT_PATH }}
          git pull origin main
          docker compose -f docker-compose.yml pull
          docker compose -f docker-compose.yml build --pull
          docker compose -f docker-compose.yml up -d --remove-orphans
          echo "Deployment completed!"
          docker compose -f docker-compose.yml ps
```

---

## Quick Start Checklist

- [ ] Step 1: Generate SSH key pair
- [ ] Step 2: Add public key to server
- [ ] Step 3: Add 5 secrets to GitHub
- [ ] Step 4: Create `.github/workflows/deploy.yml` in repo root
- [ ] Step 5: Commit and push
- [ ] Step 6: Check Actions tab in GitHub
- [ ] Test: Make a change and push again

---

**That's it!** No Jenkins installation needed. Everything runs on GitHub's servers and just SSHes to your server to deploy.
