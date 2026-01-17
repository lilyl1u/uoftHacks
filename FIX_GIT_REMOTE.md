# Fix Git Remote URL

Your remote is pointing to `lilyl1u` but you're logged in as `lilyliu5`.

## Option 1: Update Remote to Your Account (lilyliu5)

If the repository exists under `lilyliu5`:

```bash
git remote set-url origin https://github.com/lilyliu5/uoftHacks.git
git push
```

## Option 2: Use SSH (Recommended - No username issues)

1. Change remote to SSH:
```bash
git remote set-url origin git@github.com:lilyliu5/uoftHacks.git
git push
```

This uses your SSH key instead of username/password.

## Option 3: If Repo is Under lilyl1u Account

If the repository actually belongs to `lilyl1u` and you have access:

1. Authenticate as `lilyl1u`:
```bash
git remote set-url origin https://github.com/lilyl1u/uoftHacks.git
git push
```

You'll be prompted for credentials - use `lilyl1u`'s credentials.

## Check Current Remote

To see what remote is set:
```bash
git remote -v
```

## Quick Fix

Most likely you want to change it to your account:
```bash
git remote set-url origin https://github.com/lilyliu5/uoftHacks.git
git push
```
