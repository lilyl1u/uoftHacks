# Push to lilyl1u Repository

The remote is set to `lilyl1u/uoftHacks`. To push, you need to authenticate as `lilyl1u`.

## Quick Fix: Use Personal Access Token

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Make sure you're logged in as `lilyl1u`
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `uoftHacks-push`
   - Expiration: Choose your preference (90 days, 1 year, etc.)
   - Select scope: ✅ **repo** (Full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately!** (It starts with `ghp_`)

2. **Push using the token:**
   ```bash
   git push
   ```
   
   When prompted:
   - **Username:** `lilyl1u`
   - **Password:** Paste your Personal Access Token (NOT your GitHub password)

## Alternative: Use SSH (No password prompts)

1. **Check if you have SSH key:**
   ```bash
   ls -la ~/.ssh/id_*.pub
   ```

2. **If no SSH key, generate one:**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```
   (Press Enter to accept defaults)

3. **Add SSH key to GitHub:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output, then:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key and save

4. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:lilyl1u/uoftHacks.git
   git push
   ```

## If You Get "Permission Denied"

Make sure you're logged into GitHub as `lilyl1u`, not `lilyliu5`:
- Check: https://github.com (top right corner should show `lilyl1u`)
- If it shows `lilyliu5`, log out and log back in as `lilyl1u`
