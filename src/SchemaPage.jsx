import { useState } from 'react'
import { ChevronRight, ChevronDown, Tag, Hash, Layers, AlignLeft } from 'lucide-react'

// ── Schema data (embedded) ────────────────────────────────────────────────────
const RAW = [
  { category: 'Intention', first_order: 'Formal Use', second_order: 'Formal Use', machine_label: 'formal_use', description: 'Use of space aligned with an explicit institutional, programmed, or designed purpose.', included: 'formal_use; formaluse', count: 139 },
  { category: 'Intention', first_order: 'Informal Use', second_order: 'Informal Use', machine_label: 'informal_use', description: 'Everyday, casual, or unprogrammed occupation of space.', included: 'informal_use', count: 110 },
  { category: 'Intention', first_order: 'Adaptive Use', second_order: 'Adaptive Use', machine_label: 'adaptive_use', description: 'Improvised or reinterpreted use of spatial features beyond their intended purpose.', included: 'Adaptive_Use', count: 15 },
  { category: 'Activity', first_order: 'Posture / Occupation', second_order: 'Sitting', machine_label: 'sitting', description: 'Seated occupation of space, including direct sitting on furniture or informal surfaces.', included: 'sitting; Sitting', count: 586 },
  { category: 'Activity', first_order: 'Posture / Occupation', second_order: 'Resting / Reclined', machine_label: 'resting_reclined', description: 'Resting, reclining, slouching, tired, sleeping, or lying-down postures.', included: 'resting; Reclined; Slouching; Chilling; Tired; leaning; sleeping; Laying; hanging; uncomfortable', count: 261 },
  { category: 'Activity', first_order: 'Temporal Use', second_order: 'Waiting', machine_label: 'waiting', description: 'Waiting or lingering in place.', included: 'Waiting', count: 36 },
  { category: 'Activity', first_order: 'Social Activity', second_order: 'Socializing / Interaction', machine_label: 'socializing_interaction', description: 'Talking, socializing, engaging with companions, friends, partners, or groups.', included: 'socializing; Interactions; Talking; Partner; toward_companions; engaged; group; Friends; chatting; Couple; Speaking; Meeting', count: 359 },
  { category: 'Activity', first_order: 'Productive Activity', second_order: 'Working / Studying', machine_label: 'working_studying', description: 'Work, study, lecture, reading, or computer-oriented activity.', included: 'Working; working; Studying; At_lecture; reading', count: 96 },
  { category: 'Activity', first_order: 'Consumption', second_order: 'Eating / Drinking', machine_label: 'eating_drinking', description: 'Eating, drinking, dining, or picnic-like consumption activity.', included: 'eating; Eating; Drinking; Dining; picnic', count: 110 },
  { category: 'Activity', first_order: 'Device Use', second_order: 'Phone / Device Use', machine_label: 'phone_device_use', description: 'Using or being oriented toward a phone or other personal device.', included: 'Phone; phone; Device; callin', count: 151 },
  { category: 'Activity', first_order: 'Attention / Observation', second_order: 'Watching / Observing', machine_label: 'watching_observing', description: 'Looking, watching, seeing, viewing, or observing.', included: 'Seeing; watching; View; observing', count: 30 },
  { category: 'Activity', first_order: 'Recreation', second_order: 'Playing / Music / Gaming', machine_label: 'playing_recreation', description: 'Recreational play, gaming, music, or instrument use.', included: 'Playing; playing_music; Gaming; Instrument', count: 23 },
  { category: 'Activity', first_order: 'Movement / Mobility', second_order: 'Transit / Mobility', machine_label: 'transit_mobility', description: 'Commuting, walking, riding, transit, or movement through space.', included: 'Commuting; transportation_mode; Walking; travel; In_transit; subway; Riding; bike; Mobility_Device', count: 84 },
  { category: 'Activity', first_order: 'Representation', second_order: 'Posed', machine_label: 'posed', description: 'Intentionally posed or performative body orientation.', included: 'Posed', count: 19 },
  { category: 'Social Orientation', first_order: 'Companionship', second_order: 'Alone', machine_label: 'alone', description: 'Individual or solitary presence; includes prior "individual" tag.', included: 'alone; Individual', count: 164 },
  { category: 'Social Orientation', first_order: 'Companionship', second_order: 'Alone Together', machine_label: 'alone_together', description: 'Co-present but socially separate occupation.', included: 'alone_together', count: 13 },
  { category: 'Environment', first_order: 'Setting', second_order: 'Outdoors', machine_label: 'outdoors', description: 'Outdoor spatial setting.', included: 'outdoors', count: 164 },
  { category: 'Environment', first_order: 'Setting', second_order: 'Indoors', machine_label: 'indoors', description: 'Indoor spatial setting.', included: 'Indoors', count: 68 },
  { category: 'Environment', first_order: 'Sun / Shade', second_order: 'Shade', machine_label: 'shade', description: 'Shade or avoidance of direct sun.', included: 'Shade; cooling', count: 37 },
  { category: 'Environment', first_order: 'Green / Landscape', second_order: 'Green Condition', machine_label: 'green_condition', description: 'Grass, parks, landscape, or orientation toward green space.', included: 'grass; Park; near_green; toward_green', count: 51 },
  { category: 'Environment', first_order: 'Spatial Conditions', second_order: 'Circulation Path', machine_label: 'circulation_path', description: 'Spatial condition associated with circulation routes, edges, paths, or movement flows.', included: 'circulation_path; toward_flow', count: 16 },
  { category: 'Environment', first_order: 'Orientation Toward', second_order: 'Toward Public Activity', machine_label: 'toward_public_activity', description: 'Orientation toward visible public activity.', included: 'toward_public_activity', count: 10 },
  { category: 'Space / Support', first_order: 'Furniture', second_order: 'Chair', machine_label: 'chair', description: 'Chair or chair-like seating support.', included: 'Chair', count: 127 },
  { category: 'Space / Support', first_order: 'Furniture', second_order: 'Bench', machine_label: 'bench', description: 'Bench seating.', included: 'Bench', count: 87 },
  { category: 'Space / Support', first_order: 'Furniture', second_order: 'Table', machine_label: 'table', description: 'Table or table-like support surface.', included: 'table; PicnicTable', count: 57 },
  { category: 'Space / Support', first_order: 'Informal Support', second_order: 'Stairs / Steps', machine_label: 'stairs_steps', description: 'Stairs, steps, or stepped surfaces used for occupation or movement.', included: 'stairs; Steps; watersteps', count: 48 },
  { category: 'Space / Support', first_order: 'Informal Support', second_order: 'Ground / Floor', machine_label: 'ground_surface', description: 'Ground, floor, or direct surface occupation.', included: 'ground; edge', count: 36 },
  { category: 'Space / Support', first_order: 'Informal Support', second_order: 'Curb', machine_label: 'curb', description: 'Curb or curb-like edge used as support or spatial boundary.', included: 'curb', count: 17 },
  { category: 'Space / Support', first_order: 'Informal Support', second_order: 'Rock', machine_label: 'rock', description: 'Rock or landscape element used as support.', included: 'rock', count: 12 },
  { category: 'Space / Support', first_order: 'Furniture', second_order: 'Other Seating Furniture', machine_label: 'other_seating_furniture', description: 'Other seating furniture such as couch, stool, or bar seating.', included: 'Couch; Stool; bar', count: 9, note: 'Below 10; keep only if analytically important' },
  { category: 'Space / Support', first_order: 'Boundary / Edge', second_order: 'Railing', machine_label: 'railing', description: 'Railing or rail-like support/boundary.', included: 'Railing', count: 5, note: 'Below 10; keep only if analytically important' },
  { category: 'Objects', first_order: 'Food / Beverage', second_order: 'Food / Beverage', machine_label: 'food_beverage_object', description: 'Visible food or beverage objects.', included: 'Food; beverage', count: 74 },
  { category: 'Objects', first_order: 'Bags', second_order: 'Bag', machine_label: 'bag_object', description: 'Visible bag or carried personal item.', included: 'Bag', count: 22 },
  { category: 'Objects', first_order: 'Computing Device', second_order: 'Laptop / Computer', machine_label: 'computer_laptop', description: 'Laptop or computer object.', included: 'laptop; Computer', count: 32 },
  { category: 'Objects', first_order: 'Care / Parenting', second_order: 'Stroller / Parenting', machine_label: 'stroller_parenting', description: 'Stroller or parenting/care-related object or relation.', included: 'Stroller; parenting', count: 9, note: 'Below 10; keep only if analytically important' },
  { category: 'Objects', first_order: 'Animals', second_order: 'Animal / Pet', machine_label: 'animal_pet', description: 'Dogs, animals, or pet interaction.', included: 'Dog; animal; Petting', count: 20 },
]

// ── Category accent colors (blue palette) ─────────────────────────────────────
const CATEGORY_COLORS = {
  'Intention':         { bg: '#e8f0fe', border: '#93b4f5', dot: '#1a56db' },
  'Activity':          { bg: '#e8f4fd', border: '#7ec8e3', dot: '#0e7490' },
  'Social Orientation':{ bg: '#eef2ff', border: '#a5b4fc', dot: '#4f46e5' },
  'Environment':       { bg: '#ecfdf5', border: '#86efac', dot: '#16a34a' },
  'Space / Support':   { bg: '#fef9ec', border: '#fcd34d', dot: '#b45309' },
  'Objects':           { bg: '#fef2f2', border: '#fca5a5', dot: '#dc2626' },
}

// ── Build hierarchy ───────────────────────────────────────────────────────────
function buildHierarchy() {
  const cats = {}
  const maxCount = Math.max(...RAW.map(r => r.count))

  RAW.forEach(row => {
    if (!cats[row.category]) cats[row.category] = { name: row.category, groups: {}, total: 0 }
    if (!cats[row.category].groups[row.first_order])
      cats[row.category].groups[row.first_order] = { name: row.first_order, items: [] }
    cats[row.category].groups[row.first_order].items.push({ ...row, pct: row.count / maxCount })
    cats[row.category].total += row.count
  })

  return { cats, maxCount, totalLabels: RAW.length, totalInstances: RAW.reduce((s, r) => s + r.count, 0) }
}

const { cats, totalLabels, totalInstances } = buildHierarchy()

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ item, onClose }) {
  if (!item) return (
    <div style={s.detailEmpty}>
      <Layers size={28} style={{ color: 'var(--text-dim)', marginBottom: 12 }} />
      <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Select a label to explore</span>
    </div>
  )

  const colors = CATEGORY_COLORS[item.category]
  const originalTags = item.included.split(';').map(t => t.trim()).filter(Boolean)

  return (
    <div style={s.detail}>
      {/* Category badge */}
      <div style={{ ...s.catBadge, background: colors.bg, borderColor: colors.border, color: colors.dot }}>
        <span style={{ ...s.catDot, background: colors.dot }} />
        {item.category}
      </div>

      {/* Label name */}
      <h2 style={s.detailName}>{item.second_order}</h2>
      <div style={s.detailPath}>{item.first_order}</div>

      {/* Description */}
      <p style={s.detailDesc}>{item.description}</p>

      {/* Stats row */}
      <div style={s.statsRow}>
        <div style={s.statBox}>
          <span style={s.statNum}>{item.count.toLocaleString()}</span>
          <span style={s.statLab}>instances</span>
        </div>
        <div style={s.statBox}>
          <span style={s.statNum}>{originalTags.length}</span>
          <span style={s.statLab}>merged labels</span>
        </div>
      </div>

      {/* Count bar */}
      <div style={s.barTrack}>
        <div style={{ ...s.barFill, width: `${item.pct * 100}%`, background: colors.dot }} />
      </div>
      <div style={s.barCaption}>Relative frequency across dataset</div>

      {/* Machine label */}
      <div style={s.section}>
        <div style={s.sectionLabel}><Hash size={11} /> Machine Label</div>
        <code style={s.code}>{item.machine_label}</code>
      </div>

      {/* Original student tags */}
      <div style={s.section}>
        <div style={s.sectionLabel}><Tag size={11} /> Original Student Tags</div>
        <div style={s.tagCloud}>
          {originalTags.map(t => (
            <span key={t} style={s.tag}>{t}</span>
          ))}
        </div>
      </div>

      {/* Review note */}
      {item.note && (
        <div style={s.note}>
          <AlignLeft size={11} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{item.note}</span>
        </div>
      )}
    </div>
  )
}

// ── Label row ─────────────────────────────────────────────────────────────────
function LabelRow({ item, selected, onSelect }) {
  const colors = CATEGORY_COLORS[item.category]
  return (
    <button
      onClick={() => onSelect(item)}
      style={{
        ...s.labelRow,
        background: selected ? colors.bg : 'transparent',
        borderLeft: selected ? `3px solid ${colors.dot}` : '3px solid transparent',
      }}
    >
      <span style={s.labelName}>{item.second_order}</span>
      <span style={s.labelCount}>{item.count}</span>
    </button>
  )
}

// ── Category section ──────────────────────────────────────────────────────────
function CategorySection({ cat, selected, onSelect, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const colors = CATEGORY_COLORS[cat.name]
  const groups = Object.values(cat.groups)

  return (
    <div style={s.catSection}>
      <button style={s.catHeader} onClick={() => setOpen(o => !o)}>
        <div style={s.catHeaderLeft}>
          <span style={{ ...s.catDot, background: colors.dot }} />
          <span style={s.catName}>{cat.name}</span>
          <span style={s.catCount}>{cat.total}</span>
        </div>
        {open
          ? <ChevronDown size={13} style={{ color: 'var(--text-dim)' }} />
          : <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
        }
      </button>

      {open && (
        <div style={s.catBody}>
          {groups.map(group => (
            <div key={group.name} style={s.group}>
              {groups.length > 1 && (
                <div style={s.groupLabel}>{group.name}</div>
              )}
              {group.items.map(item => (
                <LabelRow
                  key={item.machine_label}
                  item={item}
                  selected={selected?.machine_label === item.machine_label}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SchemaPage() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const categories = Object.values(cats)

  const filtered = search.trim()
    ? RAW.filter(r =>
        r.second_order.toLowerCase().includes(search.toLowerCase()) ||
        r.machine_label.toLowerCase().includes(search.toLowerCase()) ||
        r.first_order.toLowerCase().includes(search.toLowerCase()) ||
        r.included.toLowerCase().includes(search.toLowerCase())
      )
    : null

  return (
    <div style={s.page}>
      {/* Summary bar */}
      <div style={s.summaryBar}>
        <div style={s.summaryItem}>
          <span style={s.summaryNum}>{totalLabels}</span>
          <span style={s.summaryLab}>label classes</span>
        </div>
        <div style={s.summaryDivider} />
        <div style={s.summaryItem}>
          <span style={s.summaryNum}>{totalInstances.toLocaleString()}</span>
          <span style={s.summaryLab}>total instances</span>
        </div>
        <div style={s.summaryDivider} />
        <div style={s.summaryItem}>
          <span style={s.summaryNum}>{Object.keys(cats).length}</span>
          <span style={s.summaryLab}>categories</span>
        </div>
      </div>

      <div style={s.body}>
        {/* Left: tree */}
        <div style={s.tree}>
          <input
            type="text"
            placeholder="Search labels…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.search}
          />

          <div style={s.treeScroll}>
            {filtered ? (
              /* Search results */
              filtered.length === 0
                ? <div style={s.noResults}>No labels match "{search}"</div>
                : filtered.map(item => (
                    <LabelRow
                      key={item.machine_label}
                      item={item}
                      selected={selected?.machine_label === item.machine_label}
                      onSelect={setSelected}
                    />
                  ))
            ) : (
              /* Full hierarchy */
              categories.map((cat, i) => (
                <CategorySection
                  key={cat.name}
                  cat={cat}
                  selected={selected}
                  onSelect={setSelected}
                  defaultOpen={i === 0}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: detail */}
        <div style={s.detailWrap}>
          <DetailPanel item={selected} />
        </div>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  summaryBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    padding: '14px 32px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-panel)',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 24px',
  },
  summaryNum: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 20,
    fontWeight: 500,
    color: 'var(--accent)',
    lineHeight: 1,
  },
  summaryLab: {
    fontSize: 10,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    background: 'var(--border)',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    flex: 1,
    overflow: 'hidden',
  },
  tree: {
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'var(--bg)',
  },
  search: {
    border: 'none',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-panel)',
    padding: '10px 16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: 'var(--text)',
    outline: 'none',
    width: '100%',
  },
  treeScroll: {
    overflowY: 'auto',
    flex: 1,
    padding: '8px 0',
  },
  catSection: {
    borderBottom: '1px solid var(--border)',
  },
  catHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  catHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  catName: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text)',
    letterSpacing: '0.01em',
  },
  catCount: {
    fontSize: 10,
    color: 'var(--text-dim)',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  catBody: {
    paddingBottom: 4,
  },
  group: {
    marginTop: 2,
  },
  groupLabel: {
    fontSize: 10,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontWeight: 500,
    padding: '6px 14px 2px 24px',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  labelRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 14px 6px 24px',
    background: 'transparent',
    border: 'none',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Inter', sans-serif",
    transition: 'background 0.12s',
  },
  labelName: {
    fontSize: 12,
    color: 'var(--text)',
  },
  labelCount: {
    fontSize: 11,
    color: 'var(--text-dim)',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  noResults: {
    padding: '20px 16px',
    fontSize: 12,
    color: 'var(--text-dim)',
    fontStyle: 'italic',
  },
  detailWrap: {
    overflowY: 'auto',
    background: 'var(--bg-panel)',
  },
  detailEmpty: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: {
    padding: '32px 36px',
    maxWidth: 560,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  catBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 20,
    border: '1px solid',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    alignSelf: 'flex-start',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  detailName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 600,
    color: 'var(--text)',
    lineHeight: 1.2,
  },
  detailPath: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontFamily: "'IBM Plex Mono', monospace",
    marginTop: -8,
  },
  detailDesc: {
    fontSize: 14,
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    borderLeft: '3px solid var(--border)',
    paddingLeft: 14,
  },
  statsRow: {
    display: 'flex',
    gap: 16,
  },
  statBox: {
    flex: 1,
    padding: '12px 16px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  statNum: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 22,
    fontWeight: 500,
    color: 'var(--accent)',
    lineHeight: 1,
  },
  statLab: {
    fontSize: 10,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
  },
  barTrack: {
    height: 4,
    background: 'var(--bg-raised)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  barCaption: {
    fontSize: 11,
    color: 'var(--text-dim)',
    marginTop: -10,
    fontFamily: "'Inter', sans-serif",
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 10,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 500,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  code: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13,
    color: 'var(--accent)',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '6px 10px',
    display: 'inline-block',
  },
  tagCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: 'var(--text-muted)',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    padding: '3px 7px',
  },
  note: {
    display: 'flex',
    gap: 7,
    padding: '10px 12px',
    background: '#fef9ec',
    border: '1px solid #fcd34d',
    borderRadius: 4,
    fontSize: 11,
    color: '#92400e',
    lineHeight: 1.6,
  },
}
