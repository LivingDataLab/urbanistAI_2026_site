# UrbanistAI — Model Playground

Standalone Netlify app for students to explore predictions from the class-trained AutoML model.

---

## Deploy in 5 steps

### 1. Set your Vertex AI endpoint ID
In the Vertex AI console, open your deployed endpoint. Copy the numeric **Endpoint ID** from the URL or the details pane.

### 2. Create a GCP service account
In GCP → IAM → Service Accounts, create a new account with the role:
`Vertex AI User` (roles/aiplatform.user)

Download a JSON key. You'll paste the entire contents as an env var.

### 3. Push to GitHub
```bash
git init
git add .
git commit -m "initial"
gh repo create urbanist-playground --public --push
```

### 4. Connect to Netlify
- New site → Import from GitHub → select your repo
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions` (Netlify auto-detects from netlify.toml)

### 5. Set environment variables in Netlify
Site settings → Environment variables → Add:

| Variable | Value |
|----------|-------|
| `GCP_SERVICE_ACCOUNT_JSON` | Paste entire contents of your service account JSON key |
| `VERTEX_PROJECT_ID` | `urbanistai-durable` |
| `VERTEX_ENDPOINT_ID` | Numeric ID from the Vertex AI endpoint URL |
| `VERTEX_LOCATION` | `us-central1` |

Trigger a redeploy. Done.

---

## Local development

```bash
npm install
npm install -g netlify-cli   # one-time
netlify dev                  # runs Vite + Functions together on :8888
```

Create a `.env` file (gitignored) with the same four variables for local testing.

---

## Shutting it down

When the exploration window closes:
1. **Delete the Vertex AI endpoint** (GCP → Vertex AI → Endpoints → Delete) — this stops billing (~$2–4/day for 1 replica)
2. Optionally take the Netlify site offline (Site settings → Danger zone → Disable)

The Netlify site itself costs nothing to host.

---

## Notes on predictions

- The model returns bounding boxes normalized 0–1 (relative to image dimensions)
- Confidence threshold defaults to 30% — students can slide it up/down to explore
- All inference runs server-side in the Netlify Function; GCP credentials are never exposed to the browser
- If the model returns no detections, try a lower threshold or a different image
