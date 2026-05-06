/**
 * netlify/functions/predict.js
 *
 * Proxies image inference requests to a Vertex AI AutoML object detection endpoint.
 * Credentials never touch the browser.
 *
 * Required Netlify environment variables:
 *   GCP_SERVICE_ACCOUNT_JSON   — full JSON of your service account key (paste as-is)
 *   VERTEX_PROJECT_ID          — e.g. "urbanistai-durable"
 *   VERTEX_ENDPOINT_ID         — numeric endpoint ID from Vertex AI console
 *   VERTEX_LOCATION            — e.g. "us-central1"
 *
 * Vertex AI AutoML object detection response shape:
 *   predictions[0].ids[]            — internal IDs (ignore)
 *   predictions[0].displayNames[]   — label strings
 *   predictions[0].confidences[]    — float 0-1
 *   predictions[0].bboxes[]         — [x_min, x_max, y_min, y_max] normalized 0-1
 */

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // ── Parse request ───────────────────────────────────────────────────────────
  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { image, mimeType } = body
  if (!image) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing image field (base64)' }) }
  }

  // ── Config from env ─────────────────────────────────────────────────────────
  const {
    GCP_SERVICE_ACCOUNT_JSON,
    VERTEX_PROJECT_ID,
    VERTEX_ENDPOINT_ID,
    VERTEX_LOCATION = 'us-central1',
  } = process.env

  if (!GCP_SERVICE_ACCOUNT_JSON || !VERTEX_PROJECT_ID || !VERTEX_ENDPOINT_ID) {
    console.error('Missing required environment variables')
    return {
      statusCode: 503,
      body: JSON.stringify({ error: 'Server misconfiguration — contact your instructor' }),
    }
  }

  // ── Get Google access token via service account JWT ────────────────────────
  let accessToken
  try {
    accessToken = await getGoogleAccessToken(GCP_SERVICE_ACCOUNT_JSON)
  } catch (e) {
    console.error('Auth error:', e)
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to authenticate with Google Cloud' }) }
  }

  // ── Call Vertex AI ──────────────────────────────────────────────────────────
  const endpoint = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_LOCATION}/endpoints/${VERTEX_ENDPOINT_ID}:predict`

  let vertexRes
  try {
    vertexRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ content: image }],
      }),
    })
  } catch (e) {
    console.error('Vertex fetch error:', e)
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not reach Vertex AI' }) }
  }

  if (!vertexRes.ok) {
    const text = await vertexRes.text()
    console.error('Vertex error response:', text)
    return {
      statusCode: 502,
      body: JSON.stringify({ error: `Vertex AI returned ${vertexRes.status}` }),
    }
  }

  const vertexData = await vertexRes.json()

  // ── Normalize predictions ───────────────────────────────────────────────────
  // Vertex AI AutoML object detection wraps everything in predictions[0]
  const raw = vertexData.predictions?.[0]
  if (!raw) {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ predictions: [] }),
    }
  }

  const { displayNames = [], confidences = [], bboxes = [] } = raw

  const predictions = displayNames.map((label, i) => {
    // Vertex bbox: [x_min, x_max, y_min, y_max] — all normalized 0-1
    const [x_min, x_max, y_min, y_max] = bboxes[i] ?? [0, 1, 0, 1]
    return {
      label,
      confidence: confidences[i] ?? 0,
      x_min,
      x_max,
      y_min,
      y_max,
    }
  })

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ predictions }),
  }
}

// ── Google Service Account → Access Token ─────────────────────────────────────
// Pure JS implementation — no google-auth-library needed (keeps cold starts fast)
async function getGoogleAccessToken(serviceAccountJson) {
  const sa = JSON.parse(serviceAccountJson)
  const scope = 'https://www.googleapis.com/auth/cloud-platform'
  const now = Math.floor(Date.now() / 1000)

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({
    iss: sa.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))

  const unsigned = `${header}.${payload}`
  const signature = await signRS256(unsigned, sa.private_key)
  const jwt = `${unsigned}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed: ${text}`)
  }

  const data = await res.json()
  return data.access_token
}

function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function signRS256(data, privateKeyPem) {
  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const encoded = new TextEncoder().encode(data)
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoded)
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }
}
