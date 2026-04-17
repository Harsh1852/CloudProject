import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable,
  DragOverlay, closestCenter,
} from "@dnd-kit/core";
import {
  listApplications, getApplicationStats, updateApplication,
  APPLICATION_STATUSES,
} from "../../services/api";

const GOLD_START = "#b8860b";
const GOLD_END = "#d4af37";

const STATUS_COLORS = {
  "Wishlist": { bg: "rgba(161,161,170,0.10)", fg: "#52525b", accent: "#a1a1aa" },
  "Applied": { bg: "rgba(184,134,11,0.10)", fg: "#78350f", accent: GOLD_START },
  "Phone Screen": { bg: "rgba(212,175,55,0.14)", fg: "#78350f", accent: GOLD_END },
  "Technical Interview": { bg: "rgba(251,191,36,0.14)", fg: "#92400e", accent: "#f59e0b" },
  "Onsite": { bg: "rgba(249,115,22,0.10)", fg: "#9a3412", accent: "#f97316" },
  "Offer": { bg: "rgba(22,163,74,0.10)", fg: "#15803d", accent: "#16a34a" },
  "Rejected": { bg: "rgba(239,68,68,0.10)", fg: "#b91c1c", accent: "#ef4444" },
  "Ghosted": { bg: "rgba(120,113,108,0.10)", fg: "#57534e", accent: "#a8a29e" },
};

const s = {
  page: { maxWidth: 1400, margin: "28px auto", padding: "0 24px 60px" },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 22, flexWrap: "wrap", gap: 12,
  },
  title: {
    fontSize: 30, fontWeight: 700, margin: 0, color: "#1c1917", letterSpacing: "-0.02em",
    fontFamily: '"Playfair Display", Georgia, serif',
  },
  subtitle: { fontSize: 14, color: "#78716c", marginTop: 4 },
  primaryBtn: {
    background: `linear-gradient(135deg,${GOLD_START},${GOLD_END})`, color: "#fff",
    border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 14,
    fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(184,134,11,.35)",
    textDecoration: "none", display: "inline-block", letterSpacing: "-0.005em",
  },
  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14,
    marginBottom: 26,
  },
  statCard: {
    background: "#fff", borderRadius: 14, padding: "20px 22px",
    boxShadow: "0 1px 3px rgba(9,9,11,0.04), 0 4px 16px rgba(9,9,11,0.03)",
    border: "1px solid rgba(28,25,23,0.06)",
  },
  statLabel: { fontSize: 11, color: "#78716c", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" },
  statValue: {
    fontSize: 30, fontWeight: 700, color: "#1c1917", marginTop: 6, lineHeight: 1,
    fontFamily: '"Playfair Display", Georgia, serif',
  },
  statSub: { fontSize: 12, color: "#78716c", marginTop: 4 },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 14, alignItems: "start",
  },
  column: {
    background: "rgba(28,25,23,0.02)", borderRadius: 14, padding: "14px 12px 16px",
    minHeight: 240, border: "1px solid rgba(28,25,23,0.06)",
    transition: "background .15s, border-color .15s",
  },
  columnOver: {
    background: "rgba(184,134,11,0.06)",
    borderColor: GOLD_END,
  },
  columnHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 12, padding: "0 4px",
  },
  columnTitle: { fontSize: 13, fontWeight: 700, color: "#1c1917", letterSpacing: "-0.005em" },
  countPill: {
    fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
  },
  appCard: {
    background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 10,
    boxShadow: "0 1px 3px rgba(9,9,11,0.04)",
    border: "1px solid rgba(28,25,23,0.08)",
    cursor: "grab", transition: "all .15s",
    display: "block", color: "inherit",
  },
  appCardDragging: { opacity: 0.4, cursor: "grabbing" },
  appCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 18px rgba(184,134,11,.12)",
    borderColor: GOLD_END,
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  company: { fontSize: 14, fontWeight: 700, color: "#1c1917", letterSpacing: "-0.005em" },
  openLink: {
    color: GOLD_START, fontSize: 15, textDecoration: "none",
    padding: 0, background: "none", border: "none", cursor: "pointer",
  },
  role: { fontSize: 13, color: "#57534e", marginBottom: 8 },
  cardMeta: { fontSize: 11, color: "#78716c", display: "flex", gap: 8, flexWrap: "wrap" },
  roundsPill: {
    fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
    background: "rgba(184,134,11,0.10)", color: "#78350f",
  },
  nextActionPill: {
    fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
    background: "rgba(251,191,36,0.12)", color: "#92400e",
  },
  empty: {
    textAlign: "center", color: "#a8a29e", fontSize: 12, padding: "24px 12px",
    border: "1.5px dashed rgba(28,25,23,0.1)", borderRadius: 8,
  },
  loading: { textAlign: "center", padding: 80, color: "#78716c", fontSize: 15 },
  error: {
    background: "#fee2e2", color: "#b91c1c", padding: 14, borderRadius: 10,
    marginBottom: 20, fontSize: 14,
  },
  dragHint: {
    fontSize: 12, color: "#78716c", marginTop: 4,
    display: "inline-flex", alignItems: "center", gap: 6,
  },
};

function DraggableCard({ app, isDragging }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const {
    attributes, listeners, setNodeRef, transform, isDragging: dragging,
  } = useDraggable({ id: app.applicationId, data: { app } });

  const rounds = (app.interviewRounds || []).length;
  const style = {
    ...s.appCard,
    ...(hover && !dragging ? s.appCardHover : null),
    ...(dragging || isDragging ? s.appCardDragging : null),
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  function openDetail(e) {
    // Stop drag from swallowing the click
    e.stopPropagation();
    navigate(`/tracker/${app.applicationId}`);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={s.cardTop}>
        <div style={s.company}>{app.company}</div>
        <button style={s.openLink} onClick={openDetail} onPointerDown={(e) => e.stopPropagation()} title="Open detail">↗</button>
      </div>
      <div style={s.role}>{app.jobTitle}</div>
      <div style={s.cardMeta}>
        {app.location && <span>📍 {app.location}</span>}
        {rounds > 0 && <span style={s.roundsPill}>{rounds} round{rounds > 1 ? "s" : ""}</span>}
        {app.nextAction && <span style={s.nextActionPill}>⏰ {app.nextAction}</span>}
      </div>
    </div>
  );
}

function Column({ status, items, colors }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const style = {
    ...s.column,
    borderTop: `3px solid ${colors.accent}`,
    ...(isOver ? s.columnOver : null),
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div style={s.columnHeader}>
        <div style={s.columnTitle}>{status}</div>
        <div style={{ ...s.countPill, background: colors.bg, color: colors.fg }}>{items.length}</div>
      </div>
      {items.length === 0 ? (
        <div style={s.empty}>Drop here</div>
      ) : (
        items.map((a) => <DraggableCard key={a.applicationId} app={a} />)
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={s.statCard}>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statValue}>{value}</div>
      {sub && <div style={s.statSub}>{sub}</div>}
    </div>
  );
}

export default function TrackerBoard() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDrag, setActiveDrag] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [a, st] = await Promise.all([listApplications(), getApplicationStats()]);
      setApps(a.applications || []);
      setStats(st);
    } catch {
      setError("Could not load applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDragEnd(evt) {
    setActiveDrag(null);
    const { active, over } = evt;
    if (!over) return;
    const fromApp = apps.find((a) => a.applicationId === active.id);
    if (!fromApp) return;
    const newStatus = over.id;
    if (!APPLICATION_STATUSES.includes(newStatus)) return;
    if (fromApp.status === newStatus) return;

    // Optimistic update
    const prev = apps;
    setApps((list) => list.map((a) =>
      a.applicationId === fromApp.applicationId ? { ...a, status: newStatus } : a,
    ));

    try {
      await updateApplication(fromApp.applicationId, { status: newStatus, statusNote: "Moved on tracker" });
      // Refresh stats after status change
      getApplicationStats().then(setStats).catch(() => {});
    } catch {
      setApps(prev); // revert on failure
      setError("Could not update status. Please try again.");
    }
  }

  if (loading) return <div style={s.loading}>Loading your tracker…</div>;

  const grouped = APPLICATION_STATUSES.reduce((acc, st) => { acc[st] = []; return acc; }, {});
  apps.forEach((a) => {
    const bucket = grouped[a.status] || (grouped[a.status] = []);
    bucket.push(a);
  });

  const pct = (n) => `${Math.round((n || 0) * 100)}%`;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Application Tracker</h1>
          <div style={s.subtitle}>
            Every role you've wished for, applied to, or interviewed for — in one place.
          </div>
          <div style={s.dragHint}>✨ Drag a card between columns to update its status.</div>
        </div>
        <Link to="/tracker/new" style={s.primaryBtn}>+ New application</Link>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {stats && (
        <div style={s.statsRow}>
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} sub="In flight now" />
          <StatCard label="Response rate" value={pct(stats.responseRate)} sub="Applied → got a call" />
          <StatCard label="Offer rate" value={pct(stats.offerRate)} sub="Applied → offer" />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveDrag(apps.find((a) => a.applicationId === e.active.id))}
        onDragCancel={() => setActiveDrag(null)}
        onDragEnd={handleDragEnd}
      >
        <div style={s.board}>
          {APPLICATION_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              items={grouped[status]}
              colors={STATUS_COLORS[status]}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDrag ? (
            <div style={{ ...s.appCard, ...s.appCardHover, cursor: "grabbing" }}>
              <div style={s.cardTop}><div style={s.company}>{activeDrag.company}</div></div>
              <div style={s.role}>{activeDrag.jobTitle}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
