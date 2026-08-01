import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, Cell, ReferenceLine,
} from "recharts";

/* ============ Design tokens — "Regatta" ============
   Saurus carmine #8A1B21 · Ivory #F5F4EF · Brass #A8863C
   Hairline #E4E2D8 · Ink #16211C · Muted #6E756C
   A quiet nod to M.S.R.V. Saurus red — deep, not loud.
   Display: Archivo (caps, tracked) · Body: Inter · Data: IBM Plex Mono
   Green (#2F6B4F) is reserved for "available / on plan" semantics.
==================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
.bh{
  --green:#8A1B21; --green-2:#6E1418; --ivory:#F5F4EF; --card:#FFFFFF;
  --line:#E4E2D8; --brass:#A8863C; --brass-soft:#F3EDDD;
  --ink:#16211C; --muted:#6E756C; --red:#A94438; --ok:#2F6B4F;
  font-family:'Inter',system-ui,sans-serif; color:var(--ink);
  background:var(--ivory); min-height:100vh; font-size:14px;
}
.bh *{box-sizing:border-box}
.disp{font-family:'Archivo',sans-serif; text-transform:uppercase; letter-spacing:.14em}
.mono{font-family:'IBM Plex Mono',monospace}
.wrap{max-width:1060px;margin:0 auto;padding:18px 16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px;margin-bottom:16px}
.card h3{margin:0 0 12px;font-family:'Archivo';font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.16em;color:var(--green)}
.btn{font:inherit;font-weight:500;font-size:13.5px;border-radius:7px;padding:8px 14px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;transition:border-color .12s}
.btn:hover{border-color:var(--green)}
.btn:focus-visible,.input:focus-visible,.tab:focus-visible,.avcell:focus-visible{outline:2px solid var(--brass);outline-offset:2px}
.btn-primary{background:var(--green);border-color:var(--green);color:#fff}
.btn-primary:hover{background:var(--green-2)}
.btn-danger{color:var(--red)}
.btn-sm{padding:4px 10px;font-size:12.5px}
.input,select.input,textarea.input{width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:7px;font:inherit;font-size:13.5px;background:#fff;color:var(--ink)}
textarea.input{resize:vertical}
label.lbl{display:block;font-family:'Archivo';font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin:12px 0 5px}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}
.row>*{flex:1;min-width:130px}
.topbar{background:var(--green);color:var(--ivory);position:sticky;top:0;z-index:20;border-bottom:2px solid var(--brass)}
.topbar .wrap{display:flex;align-items:center;gap:14px;padding-top:12px;padding-bottom:12px}
.wordmark{font-family:'Archivo';font-weight:700;font-size:17px;letter-spacing:.3em;text-transform:uppercase}
.wordmark i{font-style:normal;color:var(--brass)}
.roletag{font-family:'Archivo';font-size:10px;letter-spacing:.18em;text-transform:uppercase;border:1px solid var(--brass);color:var(--brass);border-radius:4px;padding:2px 8px}
.tabs{display:flex;gap:2px;border-bottom:1px solid var(--line);margin:16px 0 18px;flex-wrap:wrap}
.tab{border:none;background:none;font-family:'Archivo';font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.15em;padding:9px 13px;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.tab.active{color:var(--green);border-bottom-color:var(--brass)}
.sport{display:inline-flex;align-items:center;gap:7px;font-family:'Archivo';font-size:10.5px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
.sport i{width:8px;height:8px;border-radius:99px;display:inline-block}
.num{font-family:'IBM Plex Mono',monospace;font-weight:600;color:var(--green)}
.num b{color:var(--brass)}
.delta-up{color:var(--red);font-family:'IBM Plex Mono';font-size:12px}
.delta-down{color:var(--ok);font-family:'IBM Plex Mono';font-size:12px}
.sess{border:1px solid var(--line);border-radius:9px;padding:13px 14px;margin-bottom:10px;background:#fff}
.sess-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.sess-title{font-weight:600;font-size:14.5px}
.sess-meta{font-size:13px;color:var(--muted)}
.dayhdr{font-family:'Archivo';font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.16em;color:var(--muted);margin:18px 0 8px;display:flex;align-items:baseline;gap:8px}
.dayhdr:after{content:"";flex:1;border-bottom:1px solid var(--line)}
.dayhdr.today{color:var(--brass)}
.slider-row{display:grid;grid-template-columns:110px 1fr 40px;gap:12px;align-items:center;margin-bottom:9px}
.slider-row .val{font-family:'IBM Plex Mono';font-weight:600;text-align:right;color:var(--green)}
input[type=range]{width:100%;accent-color:var(--green)}
table.tbl{width:100%;border-collapse:collapse;font-size:13.5px}
table.tbl th{font-family:'Archivo';font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);text-align:left;padding:7px 8px;border-bottom:1px solid var(--green)}
table.tbl td{padding:7px 8px;border-bottom:1px solid var(--line)}
.pill-date{font-family:'IBM Plex Mono';font-size:12px;color:var(--muted)}
.banner{background:var(--brass-soft);border:1px solid #E3D5AE;border-radius:8px;padding:9px 12px;font-size:13px;margin-bottom:14px}
.event-dot{width:8px;height:8px;border-radius:99px;display:inline-block;margin-right:8px}
.login-bg{min-height:100vh;background:var(--green);display:flex;align-items:center;justify-content:center;padding:20px}
.login-card{background:var(--ivory);border-radius:12px;padding:32px;width:100%;max-width:380px;border-top:3px solid var(--brass)}
.muted{color:var(--muted);font-size:13px}
.weeknav{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.weeknav b{font-family:'Archivo';font-size:13px;text-transform:uppercase;letter-spacing:.13em;color:var(--green)}
.fb-box{border-top:1px dashed var(--line);margin-top:11px;padding-top:11px}
.avgrid{display:grid;grid-template-columns:118px repeat(3,1fr);gap:5px;max-width:460px}
.avhdr{font-family:'Archivo';font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-align:center;padding:4px 0}
.avday{font-size:12.5px;color:var(--ink);padding:7px 4px}
.avday.today{color:var(--brass);font-weight:600}
.avcell{border:1px solid var(--line);border-radius:6px;background:#fff;min-height:32px;cursor:pointer;font-family:'IBM Plex Mono';font-size:12px;color:var(--muted)}
.avcell.on{background:var(--ok);border-color:var(--ok);color:#fff}
.avcell.off{background:#F2E4E0;border-color:#DFC0B9;color:var(--red)}
.avcell.full{background:var(--ok);border-color:var(--ok);color:#fff}
.avcell.some{background:var(--brass-soft);border-color:#E3D5AE;color:var(--ink)}
.avcell.none{background:#F2E4E0;border-color:#DFC0B9;color:var(--red)}
.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-top:10px}
.legend i{width:10px;height:10px;border-radius:3px;display:inline-block;margin-right:5px;vertical-align:-1px}
.selchip{font-size:12.5px;border:1px solid var(--line);border-radius:99px;padding:4px 12px;background:#fff;cursor:pointer}
.selchip.on{background:var(--green);color:#fff;border-color:var(--green)}
@media(max-width:640px){.slider-row{grid-template-columns:88px 1fr 34px}.wrap{padding:14px 10px}}
`;

const SPORTS = {
  rowing:      { label: "Rowing",      color: "#8A1B21" },
  erging:      { label: "Erg",         color: "#A8863C" },
  strength:    { label: "Strength",    color: "#5A4634" },
  core:        { label: "Core",        color: "#6E5E8C" },
  cycling:     { label: "Cycling",     color: "#3E6E8C" },
  indoor_bike: { label: "Indoor bike", color: "#5F7F93" },
  alternative: { label: "Alternative", color: "#7A7A52" },
  other:       { label: "Other",       color: "#6E756C" },
};
const BOAT_CLASSES = {
  "1x": ["Single"], "2x": ["Bow", "Stroke"], "2-": ["Bow", "Stroke"],
  "4x": ["Bow", "2", "3", "Stroke"], "4-": ["Bow", "2", "3", "Stroke"],
  "4+": ["Bow", "2", "3", "Stroke", "Cox"],
  "8+": ["Bow", "2", "3", "4", "5", "6", "7", "Stroke", "Cox"],
};
const SLOTS = [["M", "Morning"], ["A", "Afternoon"], ["E", "Evening"]];

/* ---------- utils ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = (d) => { const x = new Date(d); const k = (x.getDay() + 6) % 7; x.setDate(x.getDate() - k); x.setHours(0, 0, 0, 0); return x; };
const niceDate = (s) => parseISO(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const shortDate = (s) => parseISO(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const todayISO = () => fmtISO(new Date());
const inWeek = (iso, mon) => { const t = parseISO(iso).getTime(); return t >= mon.getTime() && t < addDays(mon, 7).getTime(); };
const initials = (name) => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const load = (s) => (Number(s.duration) || 0) * (Number(s.rpe) || 0);

/* ---------- storage ---------- */
const KEYS = {
  users: "bh2-users", teams: "bh2-teams", sessions: "bh2-sessions",
  wellness: "bh2-wellness", events: "bh2-events", feedback: "bh2-feedback", avail: "bh2-avail",
};
async function sGet(key, fallback) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function sSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); return true; } catch { return false; }
}

/* ---------- demo seed ---------- */
function buildSeed() {
  const teams = [{ id: "t1", name: "Senior Men" }, { id: "t2", name: "Senior Women" }];
  const mk = (id, name, username, teamId) => ({ id, name, username, password: "row123", role: "athlete", teamId });
  const users = [
    { id: "u-coach", name: "Coach Demo", username: "coach", password: "stroke", role: "coach", teamId: "" },
    mk("u1", "Daan Vermeer", "daan", "t1"), mk("u2", "Pieter Bos", "pieter", "t1"),
    mk("u3", "Lars Jansen", "lars", "t1"), mk("u4", "Milan de Wit", "milan", "t1"),
    mk("u5", "Emma Peters", "emma", "t2"), mk("u6", "Sophie Kuipers", "sophie", "t2"),
  ];
  const mon = mondayOf(new Date());
  const d = (n) => fmtISO(addDays(mon, n));
  const boat = (seats) => ({ className: "4-", boatName: "De Zeearend", oars: "Croker set B", seats });
  const past = [
    { id: "p1", date: d(-7), title: "Water — steady state", teamId: "t1", sport: "rowing", duration: 90, rpe: 5, boat: boat({ Bow: "u1", "2": "u2", "3": "u3", Stroke: "u4" }) },
    { id: "p2", date: d(-6), title: "Erg — 4×2000m", teamId: "t1", sport: "erging", duration: 60, rpe: 8, ergDesc: "4×2000m, 5' rest.", ergTargets: { u1: "1:48.0", u2: "1:50.5", u3: "1:49.0", u4: "1:51.5" } },
    { id: "p3", date: d(-4), title: "Strength — lower block", teamId: "t1", sport: "strength", duration: 75, rpe: 6,
      strength: [{ name: "Back squat", sets: 4, reps: 6, note: "80% 1RM" }, { name: "Romanian deadlift", sets: 3, reps: 8, note: "" }, { name: "Leg press", sets: 3, reps: 10, note: "" }] },
    { id: "p4", date: d(-2), title: "Water — rate ladders", teamId: "t1", sport: "rowing", duration: 100, rpe: 6, boat: boat({ Bow: "u2", "2": "u1", "3": "u4", Stroke: "u3" }) },
  ];
  const current = [
    { id: uid(), date: d(0), title: "Water — steady state", teamId: "t1", sport: "rowing", duration: 90, rpe: 5, notes: "Focus on catch timing.", boat: boat({ Bow: "u1", "2": "u2", "3": "u3", Stroke: "u4" }) },
    { id: uid(), date: d(1), title: "Erg — 3×20' @ AT", teamId: "t1", sport: "erging", duration: 70, rpe: 7, ergDesc: "3×20' rate 22–24, 3' rest.", ergTargets: { u1: "1:52.0", u2: "1:54.5", u3: "1:53.0", u4: "1:55.0" } },
    { id: uid(), date: d(2), title: "Strength — lower block", teamId: "t1", sport: "strength", duration: 75, rpe: 6,
      strength: [{ name: "Back squat", sets: 4, reps: 6, note: "82.5% 1RM" }, { name: "Romanian deadlift", sets: 3, reps: 8, note: "" }, { name: "Plank", sets: 3, reps: 1, note: "60s hold" }] },
    { id: uid(), date: d(4), title: "Water — technique", teamId: "t1", sport: "rowing", duration: 100, rpe: 4, boat: boat({ Bow: "u2", "2": "u1", "3": "u4", Stroke: "u3" }) },
    { id: uid(), date: d(5), title: "Erg — 6×500m", teamId: "t1", sport: "erging", duration: 60, rpe: 8, ergDesc: "6×500m, 3' rest, open rate.", ergTargets: { u1: "1:28.5", u2: "1:31.0", u3: "1:29.5", u4: "1:32.0" } },
    { id: uid(), date: d(1), title: "Water — steady state", teamId: "t2", sport: "rowing", duration: 80, rpe: 5, boat: { className: "2x", boatName: "Waterjuffer", oars: "Club sculls 3+4", seats: { Bow: "u5", Stroke: "u6" } } },
    { id: uid(), date: d(3), title: "Core circuit", teamId: "t2", sport: "core", duration: 40, rpe: 5 },
    { id: uid(), date: d(7), title: "Water — rate ladders", teamId: "t1", sport: "rowing", duration: 90, rpe: 6 },
    { id: uid(), date: d(8), title: "Erg — 3×20' @ AT", teamId: "t1", sport: "erging", duration: 70, rpe: 7 },
    { id: uid(), date: d(9), title: "Strength — upper block", teamId: "t1", sport: "strength", duration: 70, rpe: 6, strength: [{ name: "Bench pull", sets: 4, reps: 6, note: "" }, { name: "Pull-ups", sets: 3, reps: 8, note: "" }] },
    { id: uid(), date: d(11), title: "Water — long steady", teamId: "t1", sport: "rowing", duration: 110, rpe: 4 },
    { id: uid(), date: d(14), title: "Water — race pieces", teamId: "t1", sport: "rowing", duration: 90, rpe: 8 },
    { id: uid(), date: d(16), title: "Erg — sharpening", teamId: "t1", sport: "erging", duration: 50, rpe: 7 },
  ];
  const feedback = [];
  const vary = (base, i, span) => base + (((i * 3) % (span * 2 + 1)) - span);
  ["u1", "u2", "u3", "u4"].forEach((u, ai) => {
    past.forEach((s, si) => {
      if (u === "u4" && si === 1) return; // one missing entry
      const f = { id: uid(), sessionId: s.id, userId: u, date: s.date, duration: vary(s.duration, ai + si, 8), rpe: Math.min(10, Math.max(1, vary(s.rpe, ai + si + 1, 1))), comment: si === 3 && ai === 0 ? "Legs heavy after squats" : "" };
      if (s.strength) f.strengthActuals = { 0: { weight: 90 + ai * 5, note: "" }, 1: { weight: 70 + ai * 5, note: "" }, 2: { weight: 140 + ai * 10, note: "" } };
      feedback.push(f);
    });
  });
  const wellness = [];
  users.filter((u) => u.role === "athlete").forEach((u, ai) => {
    for (let i = 27; i >= 1; i--) {
      const v = (n) => ((i * 7 + ai * 3 + n) % 10);
      wellness.push({ id: uid(), userId: u.id, date: fmtISO(addDays(new Date(), -i)), physical: 5 + (v(1) % 5), mental: 5 + (v(2) % 5), stress: 2 + (v(3) % 5), soreness: 2 + (v(4) % 6), sleep: 6 + ((v(5) % 6) * 0.5), comment: "" });
    }
  });
  const events = [
    { id: uid(), date: fmtISO(addDays(new Date(), 9)), title: "Club dinner", type: "social", teamId: "", notes: "Boathouse, 19:00" },
    { id: uid(), date: fmtISO(addDays(mon, 19)), title: "Heineken Roeivierkamp", type: "race", teamId: "t1", notes: "Amsterdam" },
    { id: uid(), date: fmtISO(addDays(mon, 47)), title: "NK Klein", type: "race", teamId: "", notes: "Bosbaan" },
  ];
  const avail = {};
  users.forEach((u, ui) => {
    avail[u.id] = {};
    for (let i = 0; i < 14; i++) {
      const day = fmtISO(addDays(new Date(), i));
      const e = {}; const k = i + ui;
      e.M = k % 4 === 0 ? -1 : 1;
      e.E = k % 3 === 0 ? -1 : 1;
      if (k % 5 === 0) e.A = 1; else if (k % 5 === 1) e.A = -1;
      avail[u.id][day] = e;
    }
  });
  return { users, teams, sessions: [...past, ...current], wellness, events, feedback, avail };
}

/* ---------- shared pieces ---------- */
const Sport = ({ sport }) => {
  const s = SPORTS[sport] || SPORTS.other;
  return <span className="sport"><i style={{ background: s.color }} />{s.label}</span>;
};
const Num = ({ v, unit = "AU" }) => <span className="num">{v}<b> {unit}</b></span>;
const Delta = ({ actual, plan }) => {
  if (plan === 0) return null;
  const pct = Math.round(((actual - plan) / plan) * 100);
  if (Math.abs(pct) < 3) return <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>on plan</span>;
  return <span className={pct > 0 ? "delta-up" : "delta-down"}>{pct > 0 ? "+" : ""}{pct}%</span>;
};

function BoatDiagram({ boat, users, highlightId }) {
  if (!boat || !boat.className) return null;
  const seats = BOAT_CLASSES[boat.className] || [];
  const rowerSeats = seats.filter((s) => s !== "Cox");
  const hasCox = seats.includes("Cox");
  const n = rowerSeats.length;
  const W = Math.max(320, n * 78 + (hasCox ? 90 : 60));
  const H = 104, cy = 56;
  const nameOf = (id) => { const u = users.find((x) => x.id === id); return u ? initials(u.name) : "—"; };
  const fullName = (id) => { const u = users.find((x) => x.id === id); return u ? u.name.split(" ")[0] : "open"; };
  return (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`Lineup for ${boat.boatName || "boat"}`}>
        <path d={`M 6 ${cy} Q 46 ${cy - 33} 110 ${cy - 33} L ${W - 110} ${cy - 33} Q ${W - 40} ${cy - 33} ${W - 6} ${cy} Q ${W - 40} ${cy + 33} ${W - 110} ${cy + 33} L 110 ${cy + 33} Q 46 ${cy + 33} 6 ${cy} Z`}
          fill="#FDFCF8" stroke="#8A1B21" strokeWidth="1.5" />
        {rowerSeats.map((seat, i) => {
          const x = 70 + (i * (W - (hasCox ? 190 : 140))) / Math.max(1, n - 1 || 1);
          const id = boat.seats?.[seat];
          const hl = id && id === highlightId;
          return (
            <g key={seat}>
              <text x={x} y={cy - 22} textAnchor="middle" fontSize="9" fill="#6E756C" fontFamily="Archivo" letterSpacing="1">{seat.toUpperCase()}</text>
              <circle cx={x} cy={cy} r="15" fill={id ? "#8A1B21" : "#fff"} stroke={hl ? "#A8863C" : "#8A1B21"} strokeWidth={hl ? 3 : 1.5} />
              <text x={x} y={cy + 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill={id ? "#F5F4EF" : "#6E756C"} fontFamily="IBM Plex Mono">{nameOf(id)}</text>
              <text x={x} y={cy + 32} textAnchor="middle" fontSize="10" fill="#16211C" fontFamily="Inter">{fullName(id)}</text>
            </g>
          );
        })}
        {hasCox && (() => {
          const x = W - 70; const id = boat.seats?.Cox; const hl = id && id === highlightId;
          return (
            <g>
              <text x={x} y={cy - 18} textAnchor="middle" fontSize="9" fill="#6E756C" fontFamily="Archivo" letterSpacing="1">COX</text>
              <circle cx={x} cy={cy} r="11" fill={id ? "#A8863C" : "#fff"} stroke={hl ? "#A8863C" : "#8A1B21"} strokeWidth={hl ? 3 : 1.5} />
              <text x={x} y={cy + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="600" fill={id ? "#fff" : "#6E756C"} fontFamily="IBM Plex Mono">{nameOf(id)}</text>
              <text x={x} y={cy + 28} textAnchor="middle" fontSize="10" fill="#16211C" fontFamily="Inter">{fullName(id)}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ---------- athlete session feedback form ---------- */
function FbForm({ s, existing, onSave, onCancel }) {
  const [f, setF] = useState(existing || { duration: s.duration, rpe: s.rpe, comment: "", strengthActuals: {} });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="fb-box">
      <div className="row">
        <div><label className="lbl">Actual duration (min)</label>
          <input className="input" type="number" min="0" value={f.duration} onChange={(e) => set("duration", e.target.value)} /></div>
        <div><label className="lbl">Your RPE (1–10)</label>
          <input className="input" type="number" min="1" max="10" value={f.rpe} onChange={(e) => set("rpe", e.target.value)} /></div>
        <div><label className="lbl">Your load</label>
          <div style={{ padding: "8px 0" }}><Num v={(Number(f.duration) || 0) * (Number(f.rpe) || 0)} /></div></div>
      </div>
      {s.strength?.length > 0 && (
        <div>
          <label className="lbl">Weights lifted</label>
          {s.strength.map((ex, i) => (
            <div className="row" key={i} style={{ marginBottom: 6, alignItems: "center" }}>
              <div style={{ flex: "0 0 170px" }}>
                <span style={{ fontSize: 13.5 }}>{ex.name}</span>
                <span className="muted mono" style={{ fontSize: 12, marginLeft: 6 }}>{ex.sets}×{ex.reps}</span>
              </div>
              <div><input className="input" type="number" step="0.5" placeholder="kg"
                value={f.strengthActuals?.[i]?.weight ?? ""}
                onChange={(e) => set("strengthActuals", { ...(f.strengthActuals || {}), [i]: { ...(f.strengthActuals?.[i] || {}), weight: e.target.value } })} /></div>
              <div style={{ flex: 2 }}><input className="input" placeholder="Note (e.g. last set 5 reps)"
                value={f.strengthActuals?.[i]?.note ?? ""}
                onChange={(e) => set("strengthActuals", { ...(f.strengthActuals || {}), [i]: { ...(f.strengthActuals?.[i] || {}), note: e.target.value } })} /></div>
            </div>
          ))}
        </div>
      )}
      <label className="lbl">Comment</label>
      <input className="input" placeholder="How did it go?" value={f.comment} onChange={(e) => set("comment", e.target.value)} />
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onSave({ ...f, duration: Number(f.duration) || 0, rpe: Number(f.rpe) || 0 })}>Save</button>
        <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ---------- session card ---------- */
function SessionCard({ s, users, teams, me, feedback, onLogFb, coachTools, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [logging, setLogging] = useState(false);
  const [armed, setArmed] = useState(false);
  const team = teams.find((t) => t.id === s.teamId);
  const isAthlete = me && me.role === "athlete";
  const myFb = isAthlete ? feedback.find((f) => f.sessionId === s.id && f.userId === me.id) : null;
  const canLog = isAthlete && s.date <= todayISO();
  const fbs = feedback.filter((f) => f.sessionId === s.id);
  const teamSize = users.filter((u) => u.role === "athlete" && u.teamId === s.teamId).length;
  const avgActual = fbs.length ? Math.round(fbs.reduce((a, f) => a + load(f), 0) / fbs.length) : null;
  const myTarget = isAthlete && s.ergTargets ? s.ergTargets[me.id] : null;
  const hasDetail = s.strength?.length || s.ergDesc || (s.ergTargets && Object.keys(s.ergTargets).length) || s.boat?.className || s.notes || (coachTools && fbs.length);

  return (
    <div className="sess">
      <div className="sess-head">
        <Sport sport={s.sport} />
        <span className="sess-title">{s.title || SPORTS[s.sport]?.label}</span>
        <span className="sess-meta">{s.duration}′ · RPE {s.rpe}</span>
        <Num v={load(s)} />
        {team && coachTools && <span className="sess-meta">· {team.name}</span>}
        <span style={{ flex: 1 }} />
        {canLog && !myFb && !logging && <button className="btn btn-sm btn-primary" onClick={() => setLogging(true)}>Log session</button>}
        {hasDetail && <button className="btn btn-sm" onClick={() => setOpen(!open)}>{open ? "Hide" : "Details"}</button>}
        {coachTools && <button className="btn btn-sm" onClick={onEdit}>Edit</button>}
        {coachTools && (
          <button className="btn btn-sm btn-danger" onBlur={() => setArmed(false)}
            onClick={() => (armed ? onDelete() : setArmed(true))}>
            {armed ? "Sure? Tap again" : "Delete"}
          </button>
        )}
      </div>

      {myTarget && <div className="sess-meta" style={{ marginTop: 6 }}>Your target: <span className="num">{myTarget}</span></div>}

      {isAthlete && myFb && !logging && (
        <div className="sess-meta" style={{ marginTop: 6 }}>
          Logged: {myFb.duration}′ · RPE {myFb.rpe} · <Num v={load(myFb)} /> <Delta actual={load(myFb)} plan={load(s)} />
          {myFb.comment ? <> · “{myFb.comment}”</> : null}
          <button className="btn btn-sm" style={{ marginLeft: 10 }} onClick={() => setLogging(true)}>Edit</button>
        </div>
      )}
      {logging && <FbForm s={s} existing={myFb} onCancel={() => setLogging(false)}
        onSave={(f) => { onLogFb({ ...f, id: myFb?.id || uid(), sessionId: s.id, userId: me.id, date: s.date }); setLogging(false); }} />}

      {coachTools && s.date <= todayISO() && (
        <div className="sess-meta" style={{ marginTop: 6 }}>
          {fbs.length === 0 ? "No athlete feedback yet." : (
            <>Team actual Ø <Num v={avgActual} /> vs plan <Num v={load(s)} /> <Delta actual={avgActual} plan={load(s)} />
              <span> · {fbs.length}/{teamSize} logged</span></>
          )}
        </div>
      )}

      {open && (
        <div style={{ marginTop: 10 }}>
          {s.notes && <p className="muted" style={{ marginTop: 0 }}>{s.notes}</p>}
          {s.ergDesc && <p style={{ margin: "6px 0" }}>{s.ergDesc}</p>}
          {s.ergTargets && Object.keys(s.ergTargets).length > 0 && !isAthlete && (
            <table className="tbl" style={{ maxWidth: 420 }}>
              <thead><tr><th>Rower</th><th>Target</th></tr></thead>
              <tbody>{Object.entries(s.ergTargets).map(([id, t]) => {
                const u = users.find((x) => x.id === id);
                return t ? <tr key={id}><td>{u ? u.name : "?"}</td><td className="mono">{t}</td></tr> : null;
              })}</tbody>
            </table>
          )}
          {s.strength?.length > 0 && (
            <table className="tbl" style={{ maxWidth: 500 }}>
              <thead><tr><th>Exercise</th><th>Sets × reps</th><th>Note</th></tr></thead>
              <tbody>{s.strength.map((e, i) => (
                <tr key={i}><td>{e.name}</td><td className="mono">{e.sets} × {e.reps}</td><td className="muted">{e.note}</td></tr>
              ))}</tbody>
            </table>
          )}
          {s.boat?.className && (
            <div>
              <div className="sess-meta" style={{ marginTop: 8 }}>
                Boat <b>{s.boat.boatName || "—"}</b> ({s.boat.className}) · Oars <b>{s.boat.oars || "—"}</b>
              </div>
              <BoatDiagram boat={s.boat} users={users} highlightId={me?.id} />
            </div>
          )}
          {coachTools && fbs.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <label className="lbl" style={{ marginTop: 0 }}>Athlete feedback</label>
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead><tr><th>Athlete</th><th>Duration</th><th>RPE</th><th>Load</th><th>vs plan</th><th>Weights / comment</th></tr></thead>
                  <tbody>
                    {users.filter((u) => u.role === "athlete" && u.teamId === s.teamId).map((u) => {
                      const f = fbs.find((x) => x.userId === u.id);
                      const wStr = f?.strengthActuals ? Object.entries(f.strengthActuals)
                        .map(([i, a]) => a.weight ? `${s.strength?.[i]?.name || "ex"} ${a.weight}kg${a.note ? ` (${a.note})` : ""}` : null)
                        .filter(Boolean).join(" · ") : "";
                      return (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          {f ? <>
                            <td className="mono">{f.duration}′</td>
                            <td className="mono">{f.rpe}</td>
                            <td><Num v={load(f)} /></td>
                            <td><Delta actual={load(f)} plan={load(s)} /></td>
                            <td className="muted">{[wStr, f.comment].filter(Boolean).join(" — ")}</td>
                          </> : <td colSpan={5} className="muted">not logged</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SliderRow = ({ label, value, onChange, min = 1, max = 10, step = 1 }) => (
  <div className="slider-row">
    <span style={{ fontSize: 13.5 }}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))} />
    <span className="val">{value}</span>
  </div>
);

/* ---------- availability grid (shared renderer) ---------- */
function AvailGrid({ days, renderCell }) {
  return (
    <div className="avgrid">
      <span />
      {SLOTS.map(([k, l]) => <span key={k} className="avhdr">{l}</span>)}
      {days.map((day) => (
        <React.Fragment key={day}>
          <span className={`avday ${day === todayISO() ? "today" : ""}`}>{niceDate(day)}</span>
          {SLOTS.map(([k]) => renderCell(day, k))}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- athlete view ---------- */
function CheckinCard({ me, wellness, onSave }) {
  const today = todayISO();
  const existing = wellness.find((w) => w.userId === me.id && w.date === today);
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState(existing || { physical: 7, mental: 7, stress: 3, soreness: 3, sleep: 8, comment: "" });
  if (existing && !editing) {
    return (
      <div className="card">
        <h3>Daily check-in — complete</h3>
        <p className="muted" style={{ margin: 0 }}>
          Physical <b className="mono">{existing.physical}</b> · Mental <b className="mono">{existing.mental}</b> ·
          Stress <b className="mono">{existing.stress}</b> · Soreness <b className="mono">{existing.soreness}</b> ·
          Sleep <b className="mono">{existing.sleep} h</b>{existing.comment ? <> · “{existing.comment}”</> : null}
        </p>
        <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => { setF(existing); setEditing(true); }}>Edit today's entry</button>
      </div>
    );
  }
  return (
    <div className="card">
      <h3>Daily check-in</h3>
      <SliderRow label="Physical feel" value={f.physical} onChange={(v) => setF({ ...f, physical: v })} />
      <SliderRow label="Mental feel" value={f.mental} onChange={(v) => setF({ ...f, mental: v })} />
      <SliderRow label="Stress" value={f.stress} onChange={(v) => setF({ ...f, stress: v })} />
      <SliderRow label="Soreness" value={f.soreness} onChange={(v) => setF({ ...f, soreness: v })} />
      <SliderRow label="Sleep (h)" value={f.sleep} onChange={(v) => setF({ ...f, sleep: v })} min={0} max={14} step={0.5} />
      <label className="lbl">Comment</label>
      <input className="input" value={f.comment} placeholder="Anything your coach should know?"
        onChange={(e) => setF({ ...f, comment: e.target.value })} />
      <button className="btn btn-primary" style={{ marginTop: 14 }}
        onClick={() => { onSave({ ...f, id: existing?.id || uid(), userId: me.id, date: today }); setEditing(false); }}>
        Save check-in
      </button>
    </div>
  );
}

function AthleteView({ me, data, saveWellness, saveFb, setAvail }) {
  const [tab, setTab] = useState("week");
  const { sessions, users, teams, events, feedback, avail } = data;
  const mySessions = sessions.filter((s) => s.teamId === me.teamId);
  const mon = mondayOf(new Date());
  const weekSessions = mySessions.filter((s) => inWeek(s.date, mon)).sort((a, b) => a.date.localeCompare(b.date));
  const weekLoad = weekSessions.reduce((a, s) => a + load(s), 0);
  const upcoming = events.filter((e) => (!e.teamId || e.teamId === me.teamId) && e.date >= todayISO())
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const byDay = (list) => {
    const g = {}; list.forEach((s) => { (g[s.date] = g[s.date] || []).push(s); });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  };
  const futureWeeks = [];
  for (let w = 0; w < 12; w++) {
    const m = addDays(mon, w * 7);
    const ss = mySessions.filter((s) => inWeek(s.date, m)).sort((a, b) => a.date.localeCompare(b.date));
    if (w === 0 || ss.length) futureWeeks.push({ mon: m, ss, total: ss.reduce((a, s) => a + load(s), 0) });
  }
  const avDays = []; for (let i = 0; i < 14; i++) avDays.push(fmtISO(addDays(new Date(), i)));
  const myAv = avail[me.id] || {};
  const cycle = (day, slot) => {
    const cur = myAv[day]?.[slot];
    const next = cur === 1 ? -1 : cur === -1 ? undefined : 1;
    const dayObj = { ...(myAv[day] || {}) };
    if (next === undefined) delete dayObj[slot]; else dayObj[slot] = next;
    setAvail({ ...avail, [me.id]: { ...myAv, [day]: dayObj } });
  };

  const cardProps = { users, teams, me, feedback, onLogFb: saveFb };

  return (
    <div>
      <div className="tabs" role="tablist">
        {[["week", "This week"], ["sched", "Schedule"], ["avail", "Availability"]].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "week" && (
        <div>
          <CheckinCard me={me} wellness={data.wellness} onSave={saveWellness} />
          <div className="card">
            <h3>This week — <Num v={weekLoad} /></h3>
            {weekSessions.length === 0 && <p className="muted">No sessions planned for this week yet.</p>}
            {byDay(weekSessions).map(([date, ss]) => (
              <div key={date}>
                <div className={`dayhdr ${date === todayISO() ? "today" : ""}`}>{niceDate(date)}{date === todayISO() ? " · today" : ""}</div>
                {ss.map((s) => <SessionCard key={s.id} s={s} {...cardProps} />)}
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Coming up</h3>
            {upcoming.length === 0 && <p className="muted">No upcoming events.</p>}
            {upcoming.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 7 }}>
                <span className="event-dot" style={{ background: e.type === "race" ? "var(--green)" : e.type === "social" ? "var(--brass)" : "#3E5A74" }} />
                <span className="pill-date">{niceDate(e.date)}</span>
                <b style={{ fontSize: 13.5 }}>{e.title}</b>
                {e.notes && <span className="muted">— {e.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "sched" && futureWeeks.map(({ mon: m, ss, total }, i) => (
        <div className="card" key={i}>
          <h3>Week of {shortDate(fmtISO(m))} — <Num v={total} /></h3>
          {ss.length === 0 && <p className="muted">Nothing planned yet.</p>}
          {byDay(ss).map(([date, list]) => (
            <div key={date}>
              <div className="dayhdr">{niceDate(date)}</div>
              {list.map((s) => <SessionCard key={s.id} s={s} {...cardProps} />)}
            </div>
          ))}
        </div>
      ))}

      {tab === "avail" && (
        <div className="card">
          <h3>My availability — next 14 days</h3>
          <p className="muted" style={{ marginTop: 0 }}>Tap a slot to cycle: available → busy → clear. Your coach uses this to plan sessions.</p>
          <AvailGrid days={avDays} renderCell={(day, slot) => {
            const v = myAv[day]?.[slot];
            return (
              <button key={slot} className={`avcell ${v === 1 ? "on" : v === -1 ? "off" : ""}`}
                aria-label={`${day} ${slot}`} onClick={() => cycle(day, slot)}>
                {v === 1 ? "✓" : v === -1 ? "✕" : ""}
              </button>
            );
          }} />
          <div className="legend">
            <span><i style={{ background: "var(--ok)" }} />Available</span>
            <span><i style={{ background: "#F2E4E0", border: "1px solid #DFC0B9" }} />Busy</span>
            <span><i style={{ background: "#fff", border: "1px solid var(--line)" }} />Not filled in</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- coach: session editor ---------- */
function SessionEditor({ initial, teams, users, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const teamAthletes = users.filter((u) => u.role === "athlete" && u.teamId === f.teamId);
  const seats = f.boat?.className ? BOAT_CLASSES[f.boat.className] : [];
  return (
    <div className="card" style={{ borderColor: "var(--green)" }}>
      <h3>{initial.id ? "Edit session" : "New session"}</h3>
      <div className="row">
        <div><label className="lbl">Date</label>
          <input className="input" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
        <div><label className="lbl">Team</label>
          <select className="input" value={f.teamId} onChange={(e) => set("teamId", e.target.value)}>
            <option value="">— pick team —</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></div>
        <div><label className="lbl">Sport</label>
          <select className="input" value={f.sport} onChange={(e) => set("sport", e.target.value)}>
            {Object.entries(SPORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select></div>
      </div>
      <div className="row">
        <div style={{ flex: 2 }}><label className="lbl">Title</label>
          <input className="input" value={f.title} placeholder="e.g. Erg — 3×20' @ AT" onChange={(e) => set("title", e.target.value)} /></div>
        <div><label className="lbl">Duration (min)</label>
          <input className="input" type="number" min="0" value={f.duration} onChange={(e) => set("duration", e.target.value)} /></div>
        <div><label className="lbl">RPE (1–10)</label>
          <input className="input" type="number" min="1" max="10" value={f.rpe} onChange={(e) => set("rpe", e.target.value)} /></div>
        <div><label className="lbl">Planned load</label>
          <div style={{ padding: "8px 0" }}><Num v={load(f)} /></div></div>
      </div>
      <label className="lbl">Notes</label>
      <textarea className="input" rows={2} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} />

      {f.sport === "strength" && (
        <div style={{ marginTop: 12 }}>
          <label className="lbl">Exercises</label>
          {(f.strength || []).map((ex, i) => (
            <div className="row" key={i} style={{ marginBottom: 6 }}>
              <div style={{ flex: 2 }}><input className="input" placeholder="Exercise" value={ex.name}
                onChange={(e) => { const l = [...f.strength]; l[i] = { ...ex, name: e.target.value }; set("strength", l); }} /></div>
              <div><input className="input" type="number" min="1" placeholder="Sets" value={ex.sets}
                onChange={(e) => { const l = [...f.strength]; l[i] = { ...ex, sets: e.target.value }; set("strength", l); }} /></div>
              <div><input className="input" type="number" min="1" placeholder="Reps" value={ex.reps}
                onChange={(e) => { const l = [...f.strength]; l[i] = { ...ex, reps: e.target.value }; set("strength", l); }} /></div>
              <div style={{ flex: 2 }}><input className="input" placeholder="Note (e.g. 80% 1RM)" value={ex.note}
                onChange={(e) => { const l = [...f.strength]; l[i] = { ...ex, note: e.target.value }; set("strength", l); }} /></div>
              <div style={{ flex: "0 0 auto", minWidth: 0 }}>
                <button className="btn btn-sm btn-danger" onClick={() => set("strength", f.strength.filter((_, j) => j !== i))}>✕</button></div>
            </div>
          ))}
          <button className="btn btn-sm" onClick={() => set("strength", [...(f.strength || []), { name: "", sets: 3, reps: 8, note: "" }])}>+ Add exercise</button>
        </div>
      )}

      {f.sport === "erging" && (
        <div style={{ marginTop: 12 }}>
          <label className="lbl">Workout description</label>
          <textarea className="input" rows={2} value={f.ergDesc || ""} placeholder="e.g. 3×20' rate 22–24, 3' rest"
            onChange={(e) => set("ergDesc", e.target.value)} />
          <label className="lbl">Individual targets{f.teamId ? "" : " — pick a team first"}</label>
          {teamAthletes.map((a) => (
            <div className="row" key={a.id} style={{ marginBottom: 6, alignItems: "center" }}>
              <div style={{ flex: "0 0 160px" }}><span style={{ fontSize: 13.5 }}>{a.name}</span></div>
              <div><input className="input mono" placeholder="e.g. 1:52.0 /500m" value={f.ergTargets?.[a.id] || ""}
                onChange={(e) => set("ergTargets", { ...(f.ergTargets || {}), [a.id]: e.target.value })} /></div>
            </div>
          ))}
        </div>
      )}

      {f.sport === "rowing" && (
        <div style={{ marginTop: 12 }}>
          <div className="row">
            <div><label className="lbl">Boat class</label>
              <select className="input" value={f.boat?.className || ""}
                onChange={(e) => set("boat", { ...(f.boat || {}), className: e.target.value, seats: {} })}>
                <option value="">— none —</option>
                {Object.keys(BOAT_CLASSES).map((c) => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="lbl">Boat name</label>
              <input className="input" value={f.boat?.boatName || ""} onChange={(e) => set("boat", { ...(f.boat || {}), boatName: e.target.value })} /></div>
            <div><label className="lbl">Oars</label>
              <input className="input" value={f.boat?.oars || ""} onChange={(e) => set("boat", { ...(f.boat || {}), oars: e.target.value })} /></div>
          </div>
          {seats.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <label className="lbl">Lineup{f.teamId ? "" : " — pick a team first"}</label>
              <div className="row">
                {seats.map((seat) => (
                  <div key={seat}>
                    <label className="lbl" style={{ margin: "0 0 3px" }}>{seat}</label>
                    <select className="input" value={f.boat?.seats?.[seat] || ""}
                      onChange={(e) => set("boat", { ...(f.boat || {}), seats: { ...(f.boat?.seats || {}), [seat]: e.target.value } })}>
                      <option value="">— open —</option>
                      {teamAthletes.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <BoatDiagram boat={f.boat} users={users} />
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn btn-primary" onClick={() => { if (!f.date || !f.teamId) { setErr("Pick a date and a team before saving."); return; } setErr(""); onSave(f); }}>
          Save session
        </button>
        <button className="btn" onClick={onCancel}>Cancel</button>
        {err && <span style={{ color: "var(--red)", fontSize: 13 }}>{err}</span>}
      </div>
    </div>
  );
}

/* ---------- coach: program ---------- */
function ProgramTab({ data, setSessions, saveFb }) {
  const { sessions, teams, users, feedback } = data;
  const [offset, setOffset] = useState(0);
  const [teamFilter, setTeamFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const mon = addDays(mondayOf(new Date()), offset * 7);
  const list = sessions.filter((s) => inWeek(s.date, mon) && (!teamFilter || s.teamId === teamFilter))
    .sort((a, b) => a.date.localeCompare(b.date));
  const total = list.reduce((a, s) => a + load(s), 0);
  const days = []; for (let i = 0; i < 7; i++) { const d = fmtISO(addDays(mon, i)); days.push([d, list.filter((s) => s.date === d)]); }
  const save = (s) => {
    const clean = { ...s, duration: Number(s.duration) || 0, rpe: Number(s.rpe) || 0 };
    setSessions(s.id ? sessions.map((x) => (x.id === s.id ? clean : x)) : [...sessions, { ...clean, id: uid() }]);
    setEditing(null);
  };
  return (
    <div>
      <div className="card">
        <div className="weeknav">
          <button className="btn btn-sm" onClick={() => setOffset(offset - 1)}>← Prev</button>
          <b>Week of {shortDate(fmtISO(mon))}</b>
          <button className="btn btn-sm" onClick={() => setOffset(offset + 1)}>Next →</button>
          {offset !== 0 && <button className="btn btn-sm" onClick={() => setOffset(0)}>Today</button>}
          <select className="input" style={{ maxWidth: 170 }} value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="">All teams</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Num v={total} unit="AU planned" />
          <span style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() =>
            setEditing({ date: fmtISO(mon), teamId: teamFilter, sport: "rowing", title: "", duration: 90, rpe: 5, notes: "" })}>
            + Add session
          </button>
        </div>
      </div>
      {editing && <SessionEditor initial={editing} teams={teams} users={users} onSave={save} onCancel={() => setEditing(null)} />}
      {days.map(([date, ss]) => (
        <div key={date}>
          <div className={`dayhdr ${date === todayISO() ? "today" : ""}`}>{niceDate(date)}{date === todayISO() ? " · today" : ""}</div>
          {ss.length === 0 && <p className="muted" style={{ margin: "2px 0 8px" }}>—</p>}
          {ss.map((s) => (
            <SessionCard key={s.id} s={s} users={users} teams={teams} feedback={feedback} coachTools
              onEdit={() => setEditing(s)} onDelete={() => setSessions(sessions.filter((x) => x.id !== s.id))} onLogFb={saveFb} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- coach: season overview ---------- */
function SeasonTab({ data }) {
  const { sessions, teams, events } = data;
  const [teamId, setTeamId] = useState(teams[0]?.id || "");
  const mon0 = mondayOf(new Date());
  const races = events.filter((e) => e.type === "race" && (!e.teamId || e.teamId === teamId)).sort((a, b) => a.date.localeCompare(b.date));
  const blockShades = ["#CBA5A2", "#AC7370", "#8F3E42", "#5C1216"];

  const weeks = useMemo(() => {
    const out = [];
    for (let w = 0; w < 16; w++) {
      const m = addDays(mon0, w * 7);
      const ss = sessions.filter((s) => s.teamId === teamId && inWeek(s.date, m));
      const race = races.find((r) => inWeek(r.date, m));
      const nextRaceIdx = races.findIndex((r) => parseISO(r.date) >= m);
      out.push({
        week: shortDate(fmtISO(m)), load: ss.reduce((a, s) => a + load(s), 0), n: ss.length,
        race: race?.title || null, block: nextRaceIdx === -1 ? races.length : nextRaceIdx,
      });
    }
    return out;
  }, [teamId, sessions, events]);

  const blocks = [];
  weeks.forEach((w, i) => {
    const last = blocks[blocks.length - 1];
    if (!last || last.block !== w.block) blocks.push({ block: w.block, from: i, to: i, total: w.load, weeksN: 1, race: w.race });
    else { last.to = i; last.total += w.load; last.weeksN += 1; if (w.race) last.race = w.race; }
  });

  return (
    <div>
      <div className="card">
        <div className="row" style={{ alignItems: "center" }}>
          <div style={{ maxWidth: 240 }}>
            <label className="lbl" style={{ marginTop: 0 }}>Team</label>
            <select className="input" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            Planned weekly load, next 16 weeks. Bar shade = training block; gold marks a race week.
          </p>
        </div>
      </div>
      <div className="card">
        <h3>Weekly load by block</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeks}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E2D8" />
            <XAxis dataKey="week" tick={{ fontSize: 10.5 }} interval={0} angle={-40} textAnchor="end" height={52} />
            <YAxis tick={{ fontSize: 11 }} width={42} />
            <Tooltip formatter={(v, n) => [v, "Load (AU)"]}
              labelFormatter={(l, p) => { const w = p?.[0]?.payload; return w?.race ? `${l} — ${w.race}` : l; }} />
            <Bar dataKey="load" radius={[3, 3, 0, 0]}>
              {weeks.map((w, i) => (
                <Cell key={i} fill={w.race ? "#A8863C" : blockShades[w.block % blockShades.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <h3>Blocks</h3>
        <table className="tbl">
          <thead><tr><th>Block</th><th>Weeks</th><th>Sessions</th><th>Total load</th><th>Ø / week</th><th>Ends with</th></tr></thead>
          <tbody>
            {blocks.map((b, i) => {
              const n = weeks.slice(b.from, b.to + 1).reduce((a, w) => a + w.n, 0);
              return (
                <tr key={i}>
                  <td className="mono">{weeks[b.from].week} → {weeks[b.to].week}</td>
                  <td className="mono">{b.weeksN}</td>
                  <td className="mono">{n}</td>
                  <td><Num v={b.total} /></td>
                  <td><Num v={Math.round(b.total / b.weeksN)} /></td>
                  <td>{b.race ? <b>{b.race}</b> : <span className="muted">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {races.length === 0 && <p className="muted">Add races under Events to split the season into blocks.</p>}
      </div>
    </div>
  );
}

/* ---------- coach: planner (availability) ---------- */
function PlannerTab({ data }) {
  const { users, teams, avail } = data;
  const [sel, setSel] = useState({});
  const [detail, setDetail] = useState(null);
  const selIds = Object.keys(sel).filter((k) => sel[k]);
  const days = []; for (let i = 0; i < 14; i++) days.push(fmtISO(addDays(new Date(), i)));
  const toggle = (id) => setSel((p) => ({ ...p, [id]: !p[id] }));
  const pickTeam = (tid) => {
    const next = {};
    users.forEach((u) => { if ((u.role === "athlete" && u.teamId === tid) || u.role === "coach") next[u.id] = true; });
    setSel(next); setDetail(null);
  };
  const stat = (day, slot) => {
    const ok = [], busy = [], unknown = [];
    selIds.forEach((id) => {
      const v = avail[id]?.[day]?.[slot];
      const u = users.find((x) => x.id === id);
      if (!u) return;
      if (v === 1) ok.push(u); else if (v === -1) busy.push(u); else unknown.push(u);
    });
    return { ok, busy, unknown };
  };
  return (
    <div>
      <div className="card">
        <h3>Who's in?</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {teams.map((t) => <button key={t.id} className="btn btn-sm" onClick={() => pickTeam(t.id)}>Select {t.name} + coaches</button>)}
          <button className="btn btn-sm" onClick={() => { setSel({}); setDetail(null); }}>Clear</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {users.map((u) => (
            <button key={u.id} className={`selchip ${sel[u.id] ? "on" : ""}`} onClick={() => toggle(u.id)}>
              {u.name}{u.role === "coach" ? " · coach" : ""}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Shared availability — next 14 days</h3>
        {selIds.length === 0 ? <p className="muted">Select athletes and coaches above to compare availability.</p> : (
          <>
            <AvailGrid days={days} renderCell={(day, slot) => {
              const { ok, busy, unknown } = stat(day, slot);
              const cls = ok.length === selIds.length ? "full" : busy.length > 0 || unknown.length > 0 ? (ok.length > 0 ? "some" : "none") : "";
              return (
                <button key={slot} className={`avcell ${cls}`} onClick={() => setDetail({ day, slot })}
                  aria-label={`${day} ${slot}: ${ok.length} of ${selIds.length} available`}>
                  {ok.length}/{selIds.length}
                </button>
              );
            }} />
            <div className="legend">
              <span><i style={{ background: "var(--ok)" }} />Everyone available</span>
              <span><i style={{ background: "var(--brass-soft)", border: "1px solid #E3D5AE" }} />Partial</span>
              <span><i style={{ background: "#F2E4E0", border: "1px solid #DFC0B9" }} />No one</span>
            </div>
            {detail && (() => {
              const { ok, busy, unknown } = stat(detail.day, detail.slot);
              const slotName = SLOTS.find(([k]) => k === detail.slot)?.[1];
              return (
                <div style={{ marginTop: 14, borderTop: "1px dashed var(--line)", paddingTop: 12, fontSize: 13.5 }}>
                  <b>{niceDate(detail.day)} · {slotName}</b>
                  <p style={{ margin: "6px 0 2px" }}><span style={{ color: "var(--ok)" }}>Available:</span> {ok.map((u) => u.name).join(", ") || "—"}</p>
                  <p style={{ margin: "2px 0" }}><span style={{ color: "var(--red)" }}>Busy:</span> {busy.map((u) => u.name).join(", ") || "—"}</p>
                  <p style={{ margin: "2px 0" }}><span className="muted">Not filled in:</span> {unknown.map((u) => u.name).join(", ") || "—"}</p>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- coach: athlete dashboards ---------- */
function AthletesTab({ data }) {
  const athletes = data.users.filter((u) => u.role === "athlete");
  const [sel, setSel] = useState(athletes[0]?.id || "");
  const a = athletes.find((x) => x.id === sel);

  const daily = useMemo(() => {
    if (!a) return [];
    const out = [];
    for (let i = 27; i >= 0; i--) {
      const d = fmtISO(addDays(new Date(), -i));
      const w = data.wellness.find((x) => x.userId === a.id && x.date === d);
      out.push({ date: shortDate(d), sleep: w?.sleep ?? null, physical: w?.physical ?? null, mental: w?.mental ?? null, stress: w?.stress ?? null });
    }
    return out;
  }, [sel, data.wellness]);

  const weekly = useMemo(() => {
    if (!a) return [];
    const out = [];
    for (let w = 7; w >= 0; w--) {
      const m = addDays(mondayOf(new Date()), -7 * w);
      const planned = data.sessions.filter((s) => s.teamId === a.teamId && inWeek(s.date, m)).reduce((acc, s) => acc + load(s), 0);
      const actual = data.feedback.filter((f) => f.userId === a.id && inWeek(f.date, m)).reduce((acc, f) => acc + load(f), 0);
      out.push({ week: shortDate(fmtISO(m)), planned, actual });
    }
    return out;
  }, [sel, data.sessions, data.feedback]);

  const recent = data.wellness.filter((w) => w.userId === sel).sort((x, y) => y.date.localeCompare(x.date)).slice(0, 7);

  if (!a) return <p className="muted">No athletes yet — add them under Squad.</p>;
  return (
    <div>
      <div className="card">
        <div className="row" style={{ alignItems: "center" }}>
          <div style={{ maxWidth: 260 }}>
            <label className="lbl" style={{ marginTop: 0 }}>Athlete</label>
            <select className="input" value={sel} onChange={(e) => setSel(e.target.value)}>
              {athletes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <p className="muted" style={{ margin: 0 }}>Team: {data.teams.find((t) => t.id === a.teamId)?.name || "—"}</p>
        </div>
      </div>

      <div className="card">
        <h3>Planned vs actual weekly load</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E2D8" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={42} />
            <Tooltip /><Legend />
            <Bar dataKey="planned" fill="#CDBDBB" name="Planned (AU)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="actual" fill="#8A1B21" name="Actual (AU)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Sleep — last 28 days</h3>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E2D8" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} width={28} />
            <Tooltip />
            <ReferenceLine y={8} stroke="#A8863C" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="sleep" stroke="#8A1B21" strokeWidth={2} dot={false} connectNulls name="Sleep (h)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Readiness — last 28 days</h3>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E2D8" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} width={28} />
            <Tooltip /><Legend />
            <Line type="monotone" dataKey="physical" stroke="#8A1B21" strokeWidth={2} dot={false} connectNulls name="Physical" />
            <Line type="monotone" dataKey="mental" stroke="#A8863C" strokeWidth={2} dot={false} connectNulls name="Mental" />
            <Line type="monotone" dataKey="stress" stroke="#3E5A74" strokeWidth={2} dot={false} connectNulls name="Stress" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Recent check-ins</h3>
        {recent.length === 0 && <p className="muted">No check-ins yet.</p>}
        {recent.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Date</th><th>Phys</th><th>Ment</th><th>Stress</th><th>Sore</th><th>Sleep</th><th>Comment</th></tr></thead>
              <tbody>{recent.map((w) => (
                <tr key={w.id}>
                  <td className="pill-date">{niceDate(w.date)}</td>
                  <td className="mono">{w.physical}</td><td className="mono">{w.mental}</td>
                  <td className="mono">{w.stress}</td><td className="mono">{w.soreness}</td>
                  <td className="mono">{w.sleep} h</td><td className="muted">{w.comment}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- coach: squad (teams & accounts) ---------- */
function SquadTab({ data, setUsers, setTeams }) {
  const { users, teams } = data;
  const [teamName, setTeamName] = useState("");
  const [nu, setNu] = useState({ name: "", username: "", password: "", role: "athlete", teamId: "" });
  const [uErr, setUErr] = useState("");
  const [armedId, setArmedId] = useState("");
  const addTeam = () => { if (!teamName.trim()) return; setTeams([...teams, { id: uid(), name: teamName.trim() }]); setTeamName(""); };
  const addUser = () => {
    if (!nu.name.trim() || !nu.username.trim() || !nu.password.trim()) { setUErr("Name, username and password are required."); return; }
    if (users.some((u) => u.username === nu.username.trim())) { setUErr("That username is taken — pick another."); return; }
    setUErr("");
    setUsers([...users, { ...nu, id: uid(), name: nu.name.trim(), username: nu.username.trim() }]);
    setNu({ name: "", username: "", password: "", role: "athlete", teamId: "" });
  };
  const twoStep = (id, action) => (armedId === id ? (setArmedId(""), action()) : setArmedId(id));
  return (
    <div>
      <div className="card">
        <h3>Teams</h3>
        {teams.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <b style={{ fontSize: 13.5 }}>{t.name}</b>
            <span className="muted">{users.filter((u) => u.teamId === t.id && u.role === "athlete").length} rowers</span>
            <button className="btn btn-sm btn-danger" onBlur={() => setArmedId("")}
              onClick={() => twoStep(t.id, () => setTeams(teams.filter((x) => x.id !== t.id)))}>
              {armedId === t.id ? "Sure? Tap again" : "Delete"}
            </button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 10 }}>
          <div><input className="input" placeholder="New team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} /></div>
          <div style={{ flex: "0 0 auto", minWidth: 0 }}><button className="btn btn-primary" onClick={addTeam}>Add team</button></div>
        </div>
      </div>

      <div className="card">
        <h3>Accounts &amp; logins</h3>
        <p className="muted" style={{ marginTop: 0 }}>Credentials are listed here so you can hand them out individually.</p>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Role</th><th>Username</th><th>Password</th><th>Team</th><th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td><span className="roletag" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>{u.role}</span></td>
                  <td className="mono">{u.username}</td>
                  <td className="mono">{u.password}</td>
                  <td>
                    {u.role === "athlete" ? (
                      <select className="input" style={{ minWidth: 130 }} value={u.teamId || ""}
                        onChange={(e) => setUsers(users.map((x) => (x.id === u.id ? { ...x, teamId: e.target.value } : x)))}>
                        <option value="">— no team —</option>
                        {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    ) : "—"}
                  </td>
                  <td><button className="btn btn-sm btn-danger" onBlur={() => setArmedId("")}
                    onClick={() => twoStep(u.id, () => setUsers(users.filter((x) => x.id !== u.id)))}>
                    {armedId === u.id ? "Sure?" : "Delete"}
                  </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <div><label className="lbl">Full name</label><input className="input" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} /></div>
          <div><label className="lbl">Username</label><input className="input" value={nu.username} onChange={(e) => setNu({ ...nu, username: e.target.value })} /></div>
          <div><label className="lbl">Password</label><input className="input" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} /></div>
          <div><label className="lbl">Role</label>
            <select className="input" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}>
              <option value="athlete">Athlete</option><option value="coach">Coach</option>
            </select></div>
          <div><label className="lbl">Team</label>
            <select className="input" value={nu.teamId} onChange={(e) => setNu({ ...nu, teamId: e.target.value })}>
              <option value="">— none —</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></div>
          <div style={{ flex: "0 0 auto", minWidth: 0 }}><button className="btn btn-primary" onClick={addUser}>Add account</button></div>
        </div>
        {uErr && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 0 }}>{uErr}</p>}
      </div>
    </div>
  );
}

/* ---------- coach: events ---------- */
function EventsTab({ data, setEvents }) {
  const { events, teams } = data;
  const [f, setF] = useState({ date: todayISO(), title: "", type: "race", teamId: "", notes: "" });
  const [err, setErr] = useState("");
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      <div className="card">
        <h3>New event</h3>
        <div className="row">
          <div><label className="lbl">Date</label><input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div style={{ flex: 2 }}><label className="lbl">Title</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><label className="lbl">Type</label>
            <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              <option value="race">Race</option><option value="social">Social</option><option value="other">Other</option>
            </select></div>
          <div><label className="lbl">Team</label>
            <select className="input" value={f.teamId} onChange={(e) => setF({ ...f, teamId: e.target.value })}>
              <option value="">Whole club</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></div>
        </div>
        <label className="lbl">Notes</label>
        <input className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => {
          if (!f.title.trim()) { setErr("Give the event a title."); return; }
          setErr("");
          setEvents([...events, { ...f, id: uid(), title: f.title.trim() }]);
          setF({ date: todayISO(), title: "", type: "race", teamId: "", notes: "" });
        }}>Add event</button>
        {err && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 0 }}>{err}</p>}
      </div>
      <div className="card">
        <h3>All events</h3>
        {upcoming.length === 0 && <p className="muted">No events yet.</p>}
        {upcoming.map((e) => (
          <div key={e.id} style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
            <span className="event-dot" style={{ background: e.type === "race" ? "var(--green)" : e.type === "social" ? "var(--brass)" : "#3E5A74" }} />
            <span className="pill-date">{niceDate(e.date)}</span>
            <b style={{ fontSize: 13.5 }}>{e.title}</b>
            <span className="muted">{e.teamId ? teams.find((t) => t.id === e.teamId)?.name : "Whole club"}{e.notes ? ` — ${e.notes}` : ""}</span>
            <button className="btn btn-sm btn-danger" onClick={() => setEvents(events.filter((x) => x.id !== e.id))}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoachView({ data, setters, saveFb }) {
  const [tab, setTab] = useState("program");
  return (
    <div>
      <div className="tabs" role="tablist">
        {[["program", "Program"], ["season", "Season"], ["planner", "Planner"], ["athletes", "Athletes"], ["squad", "Squad"], ["events", "Events"]].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "program" && <ProgramTab data={data} setSessions={setters.sessions} saveFb={saveFb} />}
      {tab === "season" && <SeasonTab data={data} />}
      {tab === "planner" && <PlannerTab data={data} />}
      {tab === "athletes" && <AthletesTab data={data} />}
      {tab === "squad" && <SquadTab data={data} setUsers={setters.users} setTeams={setters.teams} />}
      {tab === "events" && <EventsTab data={data} setEvents={setters.events} />}
    </div>
  );
}

/* ---------- login ---------- */
function Login({ users, onLogin }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  const go = () => {
    const found = users.find((x) => x.username === u.trim() && x.password === p);
    if (found) onLogin(found); else setErr("Username or password doesn't match. Ask your coach for your login.");
  };
  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="wordmark disp" style={{ color: "var(--green)", fontSize: 20, marginBottom: 6 }}>Boat<i>house</i></div>
        <p className="muted" style={{ marginTop: 0 }}>Training &amp; readiness for the whole crew.</p>
        <label className="lbl">Username</label>
        <input className="input" value={u} onChange={(e) => setU(e.target.value)} autoCapitalize="none" />
        <label className="lbl">Password</label>
        <input className="input" type="password" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />
        {err && <p style={{ color: "var(--red)", fontSize: 13 }}>{err}</p>}
        <button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={go}>Log in</button>
        <p className="muted" style={{ marginTop: 18, fontSize: 12 }}>
          Demo — coach: <span className="mono">coach / stroke</span> · rower: <span className="mono">daan / row123</span>
        </p>
      </div>
    </div>
  );
}

/* ---------- app ---------- */
export default function App() {
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    (async () => {
      let users = await sGet(KEYS.users, null);
      let d;
      if (!users || users.length === 0) {
        d = buildSeed();
        const ok = await Promise.all(Object.entries(KEYS).map(([field, key]) =>
          field === "avail" ? sSet(key, d.avail) : sSet(key, d[field])));
        if (ok.includes(false)) setWarn(true);
      } else {
        d = {
          users,
          teams: await sGet(KEYS.teams, []),
          sessions: await sGet(KEYS.sessions, []),
          wellness: await sGet(KEYS.wellness, []),
          events: await sGet(KEYS.events, []),
          feedback: await sGet(KEYS.feedback, []),
          avail: await sGet(KEYS.avail, {}),
        };
      }
      setData(d);
      try {
        const s = await window.storage.get("bh2-session", false);
        if (s) { const u = d.users.find((x) => x.id === JSON.parse(s.value)); if (u) setMe(u); }
      } catch { /* not logged in */ }
    })();
  }, []);

  const makeSetter = (field, key) => (val) => {
    setData((p) => ({ ...p, [field]: val }));
    sSet(key, val).then((ok) => { if (!ok) setWarn(true); });
  };
  const setters = {
    users: makeSetter("users", KEYS.users),
    teams: makeSetter("teams", KEYS.teams),
    sessions: makeSetter("sessions", KEYS.sessions),
    events: makeSetter("events", KEYS.events),
  };
  const setAvail = makeSetter("avail", KEYS.avail);
  const saveWellness = (entry) => {
    const rest = data.wellness.filter((w) => w.id !== entry.id && !(w.userId === entry.userId && w.date === entry.date));
    makeSetter("wellness", KEYS.wellness)([...rest, entry]);
  };
  const saveFb = (entry) => {
    const rest = data.feedback.filter((f) => f.id !== entry.id && !(f.sessionId === entry.sessionId && f.userId === entry.userId));
    makeSetter("feedback", KEYS.feedback)([...rest, entry]);
  };
  const login = (u) => { setMe(u); window.storage.set("bh2-session", JSON.stringify(u.id), false).catch(() => {}); };
  const logout = () => { setMe(null); window.storage.delete("bh2-session", false).catch(() => {}); };

  if (!data) return (
    <div className="bh"><style>{CSS}</style>
      <div className="login-bg"><p style={{ color: "var(--ivory)" }} className="disp">Getting the boats out…</p></div>
    </div>
  );

  return (
    <div className="bh">
      <style>{CSS}</style>
      {!me ? <Login users={data.users} onLogin={login} /> : (
        <>
          <div className="topbar">
            <div className="wrap">
              <span className="wordmark">Boat<i>house</i></span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 13.5 }}>{me.name}</span>
              <span className="roletag">{me.role}</span>
              <button className="btn btn-sm" style={{ background: "transparent", color: "var(--ivory)", borderColor: "rgba(245,244,239,.35)" }} onClick={logout}>Log out</button>
            </div>
          </div>
          <div className="wrap">
            {warn && <div className="banner">Saving is unavailable right now — changes will be kept for this session only.</div>}
            {me.role === "coach"
              ? <CoachView data={data} setters={setters} saveFb={saveFb} />
              : <AthleteView me={data.users.find((u) => u.id === me.id) || me} data={data}
                  saveWellness={saveWellness} saveFb={saveFb} setAvail={setAvail} />}
          </div>
        </>
      )}
    </div>
  );
}
