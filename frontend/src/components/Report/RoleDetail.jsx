import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getResult, listJobs } from "../../services/api";

const GOLD_START = "#b8860b";
const GOLD_END = "#d4af37";

const s = {
  shell: { maxWidth: 1200, margin: "32px auto", padding: "0 28px 80px" },
  back: {
    background: "none", border: "none", color: GOLD_START, cursor: "pointer",
    fontSize: 14, padding: 0, marginBottom: 18, fontWeight: 500,
  },
  hero: {
    background: "radial-gradient(circle at 15% 0%, #d4af37 0%, #92400e 35%, #1c1917 85%)",
    color: "#fff", borderRadius: 18, padding: "38px 42px", marginBottom: 24,
    boxShadow: "0 12px 40px rgba(184,134,11,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
    border: "1px solid rgba(212,175,55,0.25)",
  },
  heroTitleRow: { display: "flex", alignItems: "flex-start", gap: 22, flexWrap: "wrap" },
  heroTitle: {
    fontSize: 34, fontWeight: 700, margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em",
    fontFamily: '"Playfair Display", Georgia, serif',
  },
  matchBadge: {
    display: "inline-flex", alignItems: "baseline", gap: 4,
    padding: "8px 16px", borderRadius: 24,
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.15)",
    fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
  },
  matchBadgePct: {
    fontSize: 22, fontWeight: 800,
    background: "linear-gradient(135deg,#fde68a,#fbbf24)",
    WebkitBackgroundClip: "text", backgroundClip: "text",
    color: "transparent", WebkitTextFillColor: "transparent",
    fontFamily: '"Playfair Display", Georgia, serif',
  },
  heroReason: { fontSize: 15.5, opacity: 0.88, marginTop: 16, lineHeight: 1.6, maxWidth: 820 },
  grid: { display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 22, marginBottom: 22 },
  card: {
    background: "#fff", borderRadius: 16, padding: "26px 30px",
    border: "1px solid rgba(28,25,23,0.06)",
    boxShadow: "0 1px 3px rgba(9,9,11,0.04), 0 4px 16px rgba(9,9,11,0.03)",
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 16px",
    letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8,
  },
  list: { paddingLeft: 18, margin: 0, lineHeight: 1.75, color: "#3f3f46", fontSize: 14 },
  gapChip: {
    display: "inline-block", fontSize: 12, fontWeight: 600,
    padding: "5px 12px", borderRadius: 20,
    background: "rgba(239,68,68,0.08)", color: "#991b1b",
    border: "1px solid rgba(239,68,68,0.2)",
    marginRight: 6, marginBottom: 6,
  },
  companyChip: {
    display: "inline-block", fontSize: 13, fontWeight: 500,
    padding: "5px 12px", borderRadius: 20,
    background: "rgba(184,134,11,0.08)", color: "#78350f",
    border: "1px solid rgba(184,134,11,0.18)",
    marginRight: 6, marginBottom: 6,
  },
  tipItem: {
    padding: "10px 14px", borderRadius: 10,
    background: "rgba(184,134,11,0.04)",
    border: "1px solid rgba(184,134,11,0.14)",
    marginBottom: 8, fontSize: 13.5, color: "#3f3f46", lineHeight: 1.55,
  },
  tipIcon: { color: GOLD_START, fontWeight: 700, marginRight: 6 },
  jobsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 },
  jobCard: {
    display: "block", textDecoration: "none", color: "inherit",
    background: "#fff", border: "1px solid rgba(28,25,23,0.08)", borderRadius: 12,
    padding: "14px 16px", transition: "all .18s",
  },
  jobTitle: { fontSize: 14, fontWeight: 700, color: "#1c1917", marginBottom: 3 },
  jobCompany: { fontSize: 13, color: "#57534e", fontWeight: 500 },
  jobMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, fontSize: 11, color: "#78716c" },
  salaryPill: {
    fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20,
    background: "rgba(16,185,129,0.08)", color: "#065f46",
    border: "1px solid rgba(16,185,129,0.18)",
  },
  loading: { textAlign: "center", padding: "80px 0", color: "#78716c", fontSize: 16 },
  empty: {
    fontSize: 13, color: "#78716c", padding: "18px",
    textAlign: "center", border: "1.5px dashed rgba(28,25,23,0.1)", borderRadius: 10,
  },
};

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

function JobMiniCard({ job }) {
  const [hover, setHover] = useState(false);
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const style = hover
    ? { ...s.jobCard, transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(184,134,11,.1)", borderColor: GOLD_END }
    : s.jobCard;
  return (
    <Link to={`/jobs/${job.jobId}`} style={style}
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={s.jobTitle}>{job.title || "Untitled role"}</div>
      <div style={s.jobCompany}>{job.company || "—"}</div>
      <div style={s.jobMeta}>
        {job.location && <span>📍 {job.location}</span>}
        {salary && <span style={s.salaryPill}>{salary}</span>}
      </div>
    </Link>
  );
}

export default function RoleDetail() {
  const { resultId, roleIndex } = useParams();
  const navigate = useNavigate();
  const idx = parseInt(roleIndex, 10);
  const [result, setResult] = useState(null);
  const [jobsForRole, setJobsForRole] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getResult(resultId)
      .then((r) => {
        setResult(r);
        const role = (r.topRoles || [])[idx];
        if (!role) return;
        // List cached jobs for this result, filter to the role title
        listJobs(resultId)
          .then((data) => {
            const matching = (data.jobs || []).filter(
              (j) => (j.roleTitle || "").toLowerCase() === (role.title || "").toLowerCase(),
            );
            setJobsForRole(matching);
          })
          .catch(() => setJobsForRole([]));
      })
      .catch(() => setError("Could not load this role."));
  }, [resultId, idx]);

  if (error) return (
    <div style={s.shell}>
      <button style={s.back} onClick={() => navigate(`/results/${resultId}`)}>← Back to report</button>
      <div style={{ ...s.card, color: "#b91c1c" }}>{error}</div>
    </div>
  );
  if (!result) return <div style={s.loading}>Loading…</div>;

  const role = (result.topRoles || [])[idx];
  if (!role) return (
    <div style={s.shell}>
      <button style={s.back} onClick={() => navigate(`/results/${resultId}`)}>← Back to report</button>
      <div style={s.card}>Role not found. It may have been removed from this report.</div>
    </div>
  );

  return (
    <div style={s.shell}>
      <button style={s.back} onClick={() => navigate(`/results/${resultId}`)}>← Back to report</button>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroTitleRow}>
          <h1 style={s.heroTitle}>{role.title}</h1>
          <div style={s.matchBadge}>
            <span style={s.matchBadgePct}>{role.match_percentage || 0}%</span>
            <span style={{ opacity: 0.85 }}>match</span>
          </div>
        </div>
        {role.reason && <p style={s.heroReason}>{role.reason}</p>}
      </div>

      <div style={s.grid}>
        {/* Left: gaps + tips */}
        <div>
          {(role.resume_gaps || []).length > 0 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>⚠️ Gaps hiring managers will notice</h2>
              <div>
                {role.resume_gaps.map((g, i) => (
                  <span key={i} style={s.gapChip}>{g}</span>
                ))}
              </div>
            </div>
          )}

          {(role.application_tips || []).length > 0 && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>🎯 How to apply</h2>
              <div>
                {role.application_tips.map((tip, i) => (
                  <div key={i} style={s.tipItem}>
                    <span style={s.tipIcon}>✦</span>{tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: target companies + jobs */}
        <div>
          {(() => {
            // Prefer real companies from the live Adzuna jobs. Fall back to the
            // LLM-generated target_companies only if we haven't pulled jobs yet.
            const liveCompanies = Array.from(new Set(
              jobsForRole.map((j) => (j.company || "").trim()).filter(Boolean),
            )).slice(0, 8);
            const companies = liveCompanies.length
              ? liveCompanies
              : (role.target_companies || []);
            const source = liveCompanies.length ? "live" : "suggested";
            if (companies.length === 0) return null;
            return (
              <div style={s.card}>
                <h2 style={s.cardTitle}>
                  🏢 Target companies
                  <span style={{
                    marginLeft: 8, fontSize: 11, fontWeight: 600,
                    color: source === "live" ? "#15803d" : "#78716c",
                    background: source === "live" ? "rgba(22,163,74,0.08)" : "rgba(120,113,108,0.08)",
                    padding: "2px 9px", borderRadius: 20,
                    border: `1px solid ${source === "live" ? "rgba(22,163,74,0.2)" : "rgba(120,113,108,0.2)"}`,
                  }}>
                    {source === "live" ? "hiring now" : "suggested"}
                  </span>
                </h2>
                <div>
                  {companies.map((c, i) => (
                    <span key={i} style={s.companyChip}>{c}</span>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={s.card}>
            <h2 style={s.cardTitle}>💼 Live openings for this role</h2>
            {jobsForRole.length === 0 ? (
              <div style={s.empty}>
                No live openings for this role yet. Hit <strong>Find jobs</strong> on the main report to populate them.
              </div>
            ) : (
              <div style={s.jobsGrid}>
                {jobsForRole.map((j) => <JobMiniCard key={j.jobId} job={j} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
