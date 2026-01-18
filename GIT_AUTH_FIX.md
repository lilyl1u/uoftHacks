# Fix GitHub Authentication

The repository exists under `lilyl1u`, not `lilyliu5`. You need to authenticate properly.

## Option 1: Use Personal Access Token (Easiest)

1. Create a Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name like "uoftHacks"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. Use the token to push:
   ```bash
   git push
   ```
   When prompted:
   - Username: `lilyl1u`
   - Password: paste your Personal Access Token (not your GitHub password)

## Option 2: Embed Token in URL (Temporary)

```bash
git remote set-url origin https://lilyl1u:YOUR_TOKEN@github.com/lilyl1u/uoftHacks.git
git push
```

Replace `YOUR_TOKEN` with your Personal Access Token.

**⚠️ Security Note:** This stores the token in plain text. Remove it after pushing:
```bash
git remote set-url origin https://github.com/lilyl1u/uoftHacks.git
```

## Option 3: Use SSH (Recommended)

1. Generate SSH key (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "lily.liu@faire.com"
   ```

2. Add SSH key to GitHub:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output and add it at: https://github.com/settings/keys

3. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:lilyl1u/uoftHacks.git
   git push
   ```

## Option 4: Fork to Your Account

If you want the repo under `lilyliu5`:
1. Go to https://github.com/lilyl1u/uoftHacks
2. Click "Fork" to create a copy under your account
3. Then update remote:
   ```bash
   git remote set-url origin https://github.com/lilyliu5/uoftHacks.git
   git push
   ```
