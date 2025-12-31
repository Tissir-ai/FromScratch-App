# 🔐 Secrets Configuration Guide

## ⚠️ SECURITY IMPORTANT

**NEVER commit `.env` files or API keys to git!**

All secrets are properly protected:
- ✅ `.env` files are in `.gitignore`
- ✅ Secrets are passed via GitHub Actions
- ✅ No sensitive data in the repository

---

## 🔑 GitHub Secrets Setup

Go to your repository: `https://github.com/Tissir-ai/FromScratch-App/settings/secrets/actions`

Add these secrets:

### Required Secrets:

1. **SERVER_HOST** - Server IP address (e.g., `your-server-ip`)
2. **SERVER_USER** - SSH username (e.g., `admintissirai`)
3. **SERVER_PORT** - SSH port (e.g., `22`)
4. **SSH_PRIVATE_KEY** - Private SSH key for deployment

### API Keys (Optional but Recommended):

5. **NVIDIA_API_KEY** - Your NVIDIA API key for AI models
   ```
   nvapi-XXXXXXXXXXXXXXXXXXXX
   ```

6. **STRIPE_SECRET_KEY** - Stripe payment secret key (if using payments)
   ```
   sk_live_XXXXXXXXXXXXXXXXXXXX
   ```

7. **STRIPE_WEBHOOK_SECRET** - Stripe webhook secret
   ```
   whsec_XXXXXXXXXXXXXXXXXXXX
   ```

8. **GOOGLE_CLIENT_ID** - Google OAuth Client ID
9. **GOOGLE_CLIENT_SECRET** - Google OAuth Client Secret

10. **GITHUB_CLIENT_ID** - GitHub OAuth Client ID
11. **GITHUB_CLIENT_SECRET** - GitHub OAuth Client Secret

12. **GMAIL_USER** - Gmail address for sending password reset emails
13. **GMAIL_APP_PASSWORD** - Gmail app password

---

## 📋 How to Add Secrets

1. Go to: `https://github.com/Tissir-ai/FromScratch-App/settings/secrets/actions`
2. Click **"New repository secret"**
3. Enter the **Name** (e.g., `NVIDIA_API_KEY`)
4. Paste the **Value** (your actual secret)
5. Click **"Add secret"**

---

## 🔒 Local Development

For local development, create `.env` files:

### Backend `.env` example:
```bash
cd backend
cp .env.example .env
# Edit .env and add your local development keys
```

### Auth `.env` example:
```bash
cd auth
cp .env.example .env
# Edit .env and add your local development keys
```

**These files will NOT be committed to git!**

---

## ✅ Verification

After adding secrets:
1. Push code to main branch
2. GitHub Actions will deploy automatically
3. Secrets will be passed securely to the server
4. Check deployment logs: `https://github.com/Tissir-ai/FromScratch-App/actions`

---

## 🚨 Security Best Practices

1. ✅ Never share secrets in chat, email, or screenshots
2. ✅ Rotate secrets regularly (change API keys every 3-6 months)
3. ✅ Use different secrets for development and production
4. ✅ Revoke old secrets after rotation
5. ✅ Monitor GitHub Actions logs (secrets are masked automatically)

---

## 📞 Need Help?

If you accidentally commit a secret:
1. **Immediately revoke** the secret from the provider (Stripe, Google, etc.)
2. Remove it from git history:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/file' --prune-empty --tag-name-filter cat -- --all
   ```
3. Generate new secrets and add to GitHub Secrets
