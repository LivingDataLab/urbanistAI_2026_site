import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Info } from 'lucide-react'

// ── Palette for bounding box labels ──────────────────────────────────────────
const BOX_COLORS = [
  '#a8c97f', '#7ec8c8', '#e0a060', '#c97fa8', '#7fa8c9',
  '#c9c97f', '#e07060', '#60c990', '#c960c9', '#60a0e0',
]

function getLabelColor(label, labelMap) {
  if (!labelMap[label]) {
    const keys = Object.keys(labelMap)
    labelMap[label] = BOX_COLORS[keys.length % BOX_COLORS.length]
  }
  return labelMap[label]
}

// ── Canvas overlay component ──────────────────────────────────────────────────
function PredictionCanvas({ imageUrl, predictions, imageNaturalSize, confidenceThreshold }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const labelMapRef = useRef({})

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const rect = img.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    setCanvasSize({ width: rect.width, height: rect.height })

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const scaleX = rect.width
    const scaleY = rect.height

    const visible = predictions.filter(p => p.confidence >= confidenceThreshold)

    visible.forEach((pred) => {
      const color = getLabelColor(pred.label, labelMapRef.current)
      const x = pred.x_min * scaleX
      const y = pred.y_min * scaleY
      const w = (pred.x_max - pred.x_min) * scaleX
      const h = (pred.y_max - pred.y_min) * scaleY

      // Box
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowColor = color
      ctx.shadowBlur = 6
      ctx.strokeRect(x, y, w, h)
      ctx.shadowBlur = 0

      // Corner accents (blueprint style)
      const cs = 10
      ctx.lineWidth = 3
      ;[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy], i) => {
        const dx = i % 2 === 0 ? 1 : -1
        const dy = i < 2 ? 1 : -1
        ctx.beginPath()
        ctx.moveTo(cx, cy + dy * cs)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx + dx * cs, cy)
        ctx.stroke()
      })

      // Label pill
      const pct = Math.round(pred.confidence * 100)
      const label = `${pred.label}  ${pct}%`
      ctx.font = '500 11px "DM Mono", monospace'
      const tw = ctx.measureText(label).width
      const ph = 20, pw = tw + 12, py = y - ph - 2 < 0 ? y + 2 : y - ph - 2

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x, py, pw, ph, 3)
      ctx.fill()

      ctx.fillStyle = '#0d0f0e'
      ctx.fillText(label, x + 6, py + 14)
    })
  }, [predictions, confidenceThreshold])

  useEffect(() => {
    if (!imageUrl) return
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [imageUrl, draw])

  if (!imageUrl) return null

  return (
    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Analysis target"
        onLoad={draw}
        style={{
          display: 'block',
          maxWidth: '100%',
          maxHeight: '65vh',
          objectFit: 'contain',
          border: '1px solid var(--border)',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ predictions, confidenceThreshold }) {
  const labelMapRef = useRef({})
  const counts = {}

  predictions
    .filter(p => p.confidence >= confidenceThreshold)
    .forEach(p => {
      getLabelColor(p.label, labelMapRef.current)
      counts[p.label] = (counts[p.label] || 0) + 1
    })

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!entries.length) return null

  return (
    <div style={styles.legend}>
      {entries.map(([label, count]) => (
        <div key={label} style={styles.legendRow}>
          <span style={{ ...styles.legendDot, background: labelMapRef.current[label] }} />
          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{label}</span>
          <span style={styles.legendCount}>×{count}</span>
        </div>
      ))}
    </div>
  )
}

// ── Confidence slider ─────────────────────────────────────────────────────────
function ConfidenceSlider({ value, onChange }) {
  return (
    <div style={styles.sliderWrap}>
      <div style={styles.sliderLabel}>
        <span style={{ color: 'var(--text-muted)' }}>Confidence threshold</span>
        <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={e => onChange(e.target.value / 100)}
        style={styles.slider}
      />
      <div style={styles.sliderHints}>
        <span>show more</span>
        <span>show less</span>
      </div>
    </div>
  )
}

// ── Prediction list (collapsible) ─────────────────────────────────────────────
function PredictionList({ predictions, confidenceThreshold }) {
  const [open, setOpen] = useState(false)
  const visible = predictions.filter(p => p.confidence >= confidenceThreshold)
  const labelMap = {}
  visible.forEach(p => getLabelColor(p.label, labelMap))

  if (!visible.length) return (
    <div style={styles.empty}>No detections above threshold</div>
  )

  return (
    <div style={styles.predList}>
      <button style={styles.predToggle} onClick={() => setOpen(o => !o)}>
        <span>{visible.length} detection{visible.length !== 1 ? 's' : ''}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div style={styles.predRows}>
          {visible.map((p, i) => (
            <div key={i} style={styles.predRow}>
              <span style={{ ...styles.predDot, background: labelMap[p.label] }} />
              <span style={{ flex: 1 }}>{p.label}</span>
              <span style={styles.predConf}>{Math.round(p.confidence * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Drop zone ─────────────────────────────────────────────────────────────────
function DropZone({ onFile, loading }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) onFile(f)
  }

  return (
    <div
      style={{
        ...styles.dropZone,
        ...(dragging ? styles.dropZoneDrag : {}),
        ...(loading ? styles.dropZoneLoading : {}),
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />
      {loading ? (
        <div style={styles.dropContent}>
          <RefreshCw size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          <span style={styles.dropText}>Running model…</span>
        </div>
      ) : (
        <div style={styles.dropContent}>
          <Upload size={28} style={{ color: dragging ? 'var(--accent)' : 'var(--text-dim)' }} />
          <span style={styles.dropText}>
            {dragging ? 'Drop to analyze' : 'Upload an image'}
          </span>
          <span style={styles.dropHint}>JPG or PNG · click or drag</span>
        </div>
      )}
    </div>
  )
}

// ── Info banner ───────────────────────────────────────────────────────────────
function InfoBanner({ text }) {
  return (
    <div style={styles.infoBanner}>
      <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{text}</span>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [threshold, setThreshold] = useState(0.3)
  const [hasRun, setHasRun] = useState(false)

  const handleFile = async (file) => {
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setPredictions([])
    setError(null)
    setHasRun(false)
    await runInference(file)
  }

  const runInference = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/.netlify/functions/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
      setPredictions(data.predictions || [])
      setHasRun(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImageFile(null)
    setImageUrl(null)
    setPredictions([])
    setError(null)
    setHasRun(false)
  }

  const visibleCount = predictions.filter(p => p.confidence >= threshold).length

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          background: var(--border-bright);
          border-radius: 1px;
          outline: none;
          cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <div style={styles.headerEyebrow}>Columbia Urban Tech · Spring 2026</div>
            <h1 style={styles.headerTitle}>Model Playground</h1>
          </div>
          <div style={styles.headerBadge}>UrbanistAI</div>
        </div>
      </header>

      {/* Grid rule */}
      <div style={styles.rule} />

      <main style={styles.main}>
        {/* Left column */}
        <div style={styles.leftCol}>
          <section style={styles.panel}>
            <div style={styles.panelLabel}>01 — Upload</div>
            <p style={styles.panelDesc}>
              Upload any street-level urban image. The model your class trained
              will detect and locate objects it learned from your labeled data.
            </p>
            <DropZone onFile={handleFile} loading={loading} />
            {imageUrl && !loading && (
              <button style={styles.resetBtn} onClick={reset}>
                <RefreshCw size={12} /> New image
              </button>
            )}
          </section>

          {hasRun && (
            <section style={{ ...styles.panel, animation: 'fadeIn 0.3s ease' }}>
              <div style={styles.panelLabel}>02 — Filter</div>
              <ConfidenceSlider value={threshold} onChange={setThreshold} />
              <PredictionList predictions={predictions} confidenceThreshold={threshold} />
            </section>
          )}

          {hasRun && (
            <section style={{ ...styles.panel, animation: 'fadeIn 0.4s ease' }}>
              <div style={styles.panelLabel}>03 — Labels</div>
              <Legend predictions={predictions} confidenceThreshold={threshold} />
            </section>
          )}

          <InfoBanner text="This model was trained entirely on images labeled by your class. Its strengths, gaps, and biases reflect your collective data — not a pre-built dataset." />
        </div>

        {/* Right column — canvas */}
        <div style={styles.rightCol}>
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {imageUrl ? (
            <div style={styles.canvasWrap}>
              <PredictionCanvas
                imageUrl={imageUrl}
                predictions={predictions}
                confidenceThreshold={threshold}
              />
              {hasRun && (
                <div style={styles.statsBar}>
                  <span style={styles.statItem}>
                    <span style={styles.statNum}>{predictions.length}</span>
                    <span style={styles.statLabel}>total detections</span>
                  </span>
                  <span style={styles.statDivider} />
                  <span style={styles.statItem}>
                    <span style={styles.statNum}>{visibleCount}</span>
                    <span style={styles.statLabel}>above threshold</span>
                  </span>
                  <span style={styles.statDivider} />
                  <span style={styles.statItem}>
                    <span style={styles.statNum}>
                      {predictions.length > 0
                        ? Math.round(Math.max(...predictions.map(p => p.confidence)) * 100) + '%'
                        : '—'}
                    </span>
                    <span style={styles.statLabel}>top confidence</span>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.emptyCanvas}>
              <div style={styles.emptyGrid} />
              <div style={styles.emptyText}>
                <span style={styles.emptyLabel}>Awaiting image</span>
                <span style={styles.emptyHint}>Detections will appear here</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        <span>UrbanistAI · Columbia GSAPP Urban Tech</span>
        <span style={{ color: 'var(--text-dim)' }}>AutoML Object Detection · Student-Trained Model</span>
      </footer>
    </div>
  )
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
  },
  header: {
    borderBottom: '1px solid var(--border)',
    padding: '20px 32px',
  },
  headerInner: {
    maxWidth: 1280,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerEyebrow: {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    letterSpacing: '0.12em',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'var(--serif)',
    fontWeight: 300,
    fontSize: 28,
    letterSpacing: '-0.01em',
    color: 'var(--text)',
    fontStyle: 'italic',
  },
  headerBadge: {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--text-dim)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    border: '1px solid var(--border)',
    padding: '4px 10px',
    borderRadius: 3,
  },
  rule: {
    height: 1,
    background: 'linear-gradient(90deg, var(--accent-dim) 0%, var(--border) 40%, transparent 100%)',
  },
  main: {
    flex: 1,
    maxWidth: 1280,
    margin: '0 auto',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: 0,
    padding: '0',
  },
  leftCol: {
    borderRight: '1px solid var(--border)',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  rightCol: {
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  panelLabel: {
    fontFamily: 'var(--mono)',
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  panelDesc: {
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.7,
  },
  dropZone: {
    border: '1px dashed var(--border-bright)',
    borderRadius: 6,
    padding: '36px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent',
  },
  dropZoneDrag: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-glow)',
  },
  dropZoneLoading: {
    cursor: 'default',
    opacity: 0.7,
  },
  dropContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  dropText: {
    fontSize: 13,
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  dropHint: {
    fontSize: 11,
    color: 'var(--text-dim)',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    fontSize: 11,
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'var(--mono)',
    alignSelf: 'flex-start',
    transition: 'border-color 0.15s, color 0.15s',
  },
  sliderWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
  },
  slider: {},
  sliderHints: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: 'var(--text-dim)',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendCount: {
    marginLeft: 'auto',
    color: 'var(--text-dim)',
    fontSize: 11,
  },
  predList: {
    border: '1px solid var(--border)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  predToggle: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'var(--bg-raised)',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--mono)',
  },
  predRows: {
    display: 'flex',
    flexDirection: 'column',
  },
  predRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    fontSize: 12,
    borderTop: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
  predDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  predConf: {
    color: 'var(--accent)',
    fontWeight: 500,
  },
  empty: {
    fontSize: 12,
    color: 'var(--text-dim)',
    fontStyle: 'italic',
  },
  infoBanner: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    fontSize: 11,
    color: 'var(--text-dim)',
    lineHeight: 1.6,
    marginTop: 'auto',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '12px 16px',
    background: 'rgba(224, 112, 96, 0.08)',
    border: '1px solid rgba(224, 112, 96, 0.3)',
    borderRadius: 4,
    color: 'var(--danger)',
    fontSize: 12,
  },
  canvasWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  statsBar: {
    display: 'flex',
    gap: 24,
    padding: '12px 16px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 4,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  statNum: {
    fontFamily: 'var(--serif)',
    fontSize: 20,
    fontWeight: 300,
    color: 'var(--text)',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 10,
    color: 'var(--text-dim)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    background: 'var(--border)',
    alignSelf: 'stretch',
  },
  emptyCanvas: {
    flex: 1,
    position: 'relative',
    border: '1px solid var(--border)',
    borderRadius: 4,
    minHeight: 420,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emptyGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    opacity: 0.4,
  },
  emptyText: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  emptyLabel: {
    fontFamily: 'var(--serif)',
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: 20,
    color: 'var(--text-dim)',
  },
  emptyHint: {
    fontSize: 11,
    color: 'var(--text-dim)',
    letterSpacing: '0.08em',
  },
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '12px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontFamily: 'var(--mono)',
  },
}
