import { useState, useCallback } from 'react'
import { X, Shield, Database, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

// ── All 33 sample images ──────────────────────────────────────────────────────
const IMAGES = [
  'sitting_0001.jpg','sitting_0006.jpg','sitting_0009.jpg','sitting_0010.jpg',
  'sitting_0044.jpg','sitting_0113.jpg','sitting_0115.jpg','sitting_0116.jpg',
  'sitting_0118.jpg','sitting_0130.jpg','sitting_0136.jpg','sitting_0138.jpg',
  'sitting_0141.jpg','sitting_0154.jpg','sitting_0166.jpg','sitting_0175.jpg',
  'sitting_0215.jpg','sitting_0316.jpg','sitting_0320.jpg','sitting_0325.jpg',
  'sitting_0340.jpg','sitting_0356.jpg','sitting_0381.jpg','sitting_0390.jpg',
  'sitting_0408.jpg','sitting_0410.jpg','sitting_0411.jpg','sitting_0412.jpg',
  'sitting_0434.jpg','sitting_0440.jpg','sitting_0457.jpg','sitting_0459.jpg',
  'sitting_0474.jpg',
]

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ index, onClose, onNav }) {
  const src = `/images/${IMAGES[index]}`
  const label = IMAGES[index].replace('.jpg', '').replace('_', ' #')

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight') onNav(1)
    if (e.key === 'ArrowLeft') onNav(-1)
  }, [onClose, onNav])

  // Attach key listener on mount
  useState(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  return (
    <div style={s.lightboxOverlay} onClick={onClose}>
      <div style={s.lightboxInner} onClick={e => e.stopPropagation()}>
        <img src={src} alt={label} style={s.lightboxImg} />
        <div style={s.lightboxBar}>
          <button style={s.lightboxNav} onClick={() => onNav(-1)}>
            <ChevronLeft size={18} />
          </button>
          <span style={s.lightboxLabel}>{label} · {index + 1} / {IMAGES.length}</span>
          <button style={s.lightboxNav} onClick={() => onNav(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
        <button style={s.lightboxClose} onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Privacy pill ──────────────────────────────────────────────────────────────
function PrivacyPill({ icon: Icon, label, detail }) {
  return (
    <div style={s.pill}>
      <div style={s.pillIcon}><Icon size={14} style={{ color: 'var(--accent)' }} /></div>
      <div>
        <div style={s.pillLabel}>{label}</div>
        <div style={s.pillDetail}>{detail}</div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DatasetPage() {
  const [lightbox, setLightbox] = useState(null)

  const navigate = (dir) => {
    setLightbox(i => (i + dir + IMAGES.length) % IMAGES.length)
  }

  return (
    <div style={s.page}>

      {/* Intro strip */}
      <div style={s.intro}>
        <div style={s.introInner}>
          <div style={s.introLeft}>
            <div style={s.eyebrow}>Student Dataset — Spring 2026</div>
            <p style={s.introText}>
              Over 1,200 photographs were contributed and labeled by students using their own urbanist schema — 
              observing and categorizing the act of sitting across urban environments in New York and beyond.
              Each image was processed through a privacy pipeline before entering the dataset: 
              faces were detected and blurred using computer vision, and all EXIF metadata 
              (location, device, timestamp) was stripped. The photographs shown here are a 
              representative sample of the training data the class collectively assembled.
            </p>
          </div>
          <div style={s.pillGroup}>
            <PrivacyPill
              icon={Eye}
              label="Face Redaction"
              detail="MediaPipe + OpenCV Haar cascade detection, Gaussian blur applied"
            />
            <PrivacyPill
              icon={Shield}
              label="EXIF Stripped"
              detail="Location, device, and timestamp metadata removed on upload"
            />
            <PrivacyPill
              icon={Database}
              label="1,200+ Images"
              detail="Contributed and labeled by students across the semester"
            />
          </div>
        </div>
      </div>

      <div style={s.rule} />

      {/* Gallery count bar */}
      <div style={s.countBar}>
        <span style={s.countNum}>{IMAGES.length}</span>
        <span style={s.countLabel}>sample images shown · click to enlarge</span>
      </div>

      {/* Masonry-style grid */}
      <div style={s.grid}>
        {IMAGES.map((filename, i) => (
          <button
            key={filename}
            style={s.tile}
            onClick={() => setLightbox(i)}
          >
            <img
              src={`/images/${filename}`}
              alt={filename.replace('.jpg', '')}
              loading="lazy"
              style={s.tileImg}
            />
            <div style={s.tileOverlay}>
              <span style={s.tileLabel}>{filename.replace('.jpg','').replace('_', ' #')}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNav={navigate}
        />
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    background: 'var(--bg)',
  },
  intro: {
    background: 'var(--bg-panel)',
    padding: '24px 32px',
  },
  introInner: {
    maxWidth: 1280,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 32,
    alignItems: 'start',
  },
  introLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  eyebrow: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  introText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: 'var(--text-muted)',
    lineHeight: 1.75,
    maxWidth: 680,
  },
  pillGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 260,
  },
  pill: {
    display: 'flex',
    gap: 12,
    padding: '10px 14px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    alignItems: 'flex-start',
  },
  pillIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  pillLabel: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text)',
    letterSpacing: '0.02em',
  },
  pillDetail: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    marginTop: 2,
  },
  rule: {
    height: 1,
    background: 'linear-gradient(90deg, var(--accent-dim) 0%, var(--border) 40%, transparent 100%)',
  },
  countBar: {
    padding: '12px 32px',
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-panel)',
  },
  countNum: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--accent)',
  },
  countLabel: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 11,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 3,
    padding: '3px',
  },
  tile: {
    position: 'relative',
    aspectRatio: '4/3',
    overflow: 'hidden',
    border: 'none',
    background: 'var(--bg-raised)',
    cursor: 'pointer',
    padding: 0,
  },
  tileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.3s ease, filter 0.3s ease',
  },
  tileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px 10px 8px',
    background: 'linear-gradient(transparent, rgba(15,22,35,0.7))',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    display: 'flex',
    alignItems: 'flex-end',
  },
  tileLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: '0.06em',
  },
  lightboxOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,13,20,0.92)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  lightboxInner: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  lightboxImg: {
    maxWidth: '85vw',
    maxHeight: '80vh',
    objectFit: 'contain',
    display: 'block',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  lightboxBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  lightboxNav: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.7)',
    borderRadius: 4,
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.15s',
  },
  lightboxLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.08em',
  },
  lightboxClose: {
    position: 'absolute',
    top: -14,
    right: -14,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.7)',
    borderRadius: '50%',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
}
