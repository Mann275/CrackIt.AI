# 🚨 URGENT FIX - Render Deployment Issue

## Problem
Server is binding to `127.0.0.1:8000` instead of `0.0.0.0:$PORT`

Render can't detect the open port and deployment will fail.

## Solution

### Option 1: Update Start Command in Render Dashboard (FASTEST)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your `crackit-ai-backend` service
3. Go to **Settings** tab
4. Scroll to **Build & Deploy** section
5. Find **Start Command** field
6. Change from:
   ```
   uvicorn server:app --reload
   ```
   
   To:
   ```
   uvicorn server:app --host 0.0.0.0 --port $PORT --workers 1
   ```

7. Click **Save Changes**
8. Service will auto-redeploy

### Option 2: Use Blueprint (RECOMMENDED for future)

1. **Delete current service** from Render dashboard
2. Create new service using **Blueprint**:
   - Click "New" → "Blueprint"
   - Connect repo
   - Render will auto-detect `render.yaml`
   - Add environment variables
   - Deploy

## Why This Happens

Your `render.yaml` has the correct command:
```yaml
startCommand: uvicorn server:app --host 0.0.0.0 --port $PORT --workers 1
```

But Render is running:
```
uvicorn server:app --reload
```

This means the service was created manually, not via Blueprint, so it's not using `render.yaml`.

## Expected Result

After fix, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:10000 (Press CTRL+C to quit)
```

Notice: `0.0.0.0` and dynamic port (not 8000).

## Verify Deploy Success

```
==> Your service is live 🎉
```

---

**Quick Fix: Update Start Command in Settings to include `--host 0.0.0.0 --port $PORT`**
