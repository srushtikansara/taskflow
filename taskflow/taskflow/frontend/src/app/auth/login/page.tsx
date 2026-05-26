"use client";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const apiUrl    = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let frame = 0;

    const ribbons = Array.from({ length: 6 }, (_, i) => ({
      offset: (i / 6) * Math.PI * 2,
      speed:  0.003 + i * 0.001,
      amp:    60 + i * 18,
      y:      H * (0.25 + i * 0.1),
      hue:    200 + i * 22,
      alpha:  0.06 + i * 0.012,
    }));

    const orbs = Array.from({ length: 12 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 80 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      hue: 210 + Math.random() * 60,
      alpha: 0.03 + Math.random() * 0.05,
    }));

    const gridSpacing = 48;
    let animId: number;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);
      frame++;

      ctx.fillStyle = "#050d1a";
      ctx.fillRect(0, 0, W, H);

      // Grid dots
      const cols = Math.ceil(W / gridSpacing) + 1;
      const rows = Math.ceil(H / gridSpacing) + 1;
      ctx.fillStyle = "rgba(99,179,237,0.06)";
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          ctx.beginPath();
          ctx.arc(c * gridSpacing, r * gridSpacing, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Orbs
      orbs.forEach((o) => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},80%,60%,${o.alpha})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ribbons
      ribbons.forEach((rb) => {
        const t = frame * rb.speed + rb.offset;
        ctx.beginPath();
        ctx.moveTo(0, rb.y);
        for (let x = 0; x <= W; x += 4) {
          const y = rb.y
            + Math.sin(x * 0.008 + t) * rb.amp
            + Math.sin(x * 0.003 + t * 0.7) * rb.amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        const wg = ctx.createLinearGradient(0, rb.y - rb.amp, 0, rb.y + rb.amp);
        wg.addColorStop(0, `hsla(${rb.hue},70%,55%,0)`);
        wg.addColorStop(0.5, `hsla(${rb.hue},70%,55%,${rb.alpha})`);
        wg.addColorStop(1, `hsla(${rb.hue},70%,55%,0)`);
        ctx.fillStyle = wg;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const features = [
    "Assign tasks to teammates instantly",
    "Track progress with Kanban & Calendar views",
    "Email notifications on every update",
    "Analytics to measure team performance",
  ];

  return (
    <main style={s.root}>
      <canvas ref={canvasRef} style={s.canvas} />

      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <img
          src="/logo.png"
          alt="TaskFlow"
          style={{ height: 160, width: "auto", objectFit: "contain" }}
        />
      </nav>

      {/* ── Content grid ── */}
      <div style={s.wrap}>

        {/* ── Left ── */}
        <div style={s.left} className="login-left-col">

          {/* Eyebrow tag */}
          <div style={s.tag}>
            <span style={s.tagDot} />
            Task Management Platform
          </div>

          {/* Headline */}
          <h1 style={s.h1}>
            Built for teams<br />
            that{" "}
            <span style={s.grad}>actually ship.</span>
          </h1>

          {/* Subline */}
          <p style={s.sub}>
            Assign, track, and close work without the overhead —
            from solo sprints to cross-functional launches.
          </p>

          {/* Feature list — clean, no cards */}
          <ul style={s.list}>
            {features.map((f) => (
              <li key={f} style={s.listItem}>
                <span style={s.check}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span style={s.listText}>{f}</span>
              </li>
            ))}
          </ul>

          {/* Horizontal divider + metrics — inline text, no boxes */}
          <div style={s.metricsRow}>
            <div style={s.metricItem}>
              <span style={s.metricN}>98%</span>
              <span style={s.metricL}>on-time delivery</span>
            </div>
            <div style={s.metricSep} />
            <div style={s.metricItem}>
              <span style={s.metricN}>3×</span>
              <span style={s.metricL}>faster standup</span>
            </div>
            <div style={s.metricSep} />
            <div style={s.metricItem}>
              <span style={s.metricN}>{"< 2s"}</span>
              <span style={s.metricL}>page load</span>
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div style={s.right} className="login-right-col">
          <div style={s.card}>
            <div style={s.cardAccent} />
            <div style={s.cardBody}>

              <div style={s.cardHead}>
                <p style={s.eyebrow}>Welcome back</p>
                <h2 style={s.cardTitle}>Sign in to TaskFlow</h2>
                <p style={s.cardSub}>
                  Use your Google account to access your workspace
                </p>
              </div>

              <a
                href={`${apiUrl}/api/auth/google`}
                style={{ ...s.gBtn, ...(hovered ? s.gBtnHover : {}) }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <GoogleIcon />
                <span style={{ position: "relative", zIndex: 1 }}>
                  Continue with Google
                </span>
                <span style={s.sweep} />
              </a>

              <div style={s.divider}>
                <span style={s.divLine} />
                <span style={s.divText}>100% secure sign-in</span>
                <span style={s.divLine} />
              </div>

              <div style={s.secRow}>
                <SecBadge label="OAuth 2.0" />
                <SecBadge label="SSL Encrypted" />
                <SecBadge label="No password stored" />
              </div>

            </div>
          </div>

          <p style={s.tos}>
            By signing in you agree to our{" "}
            <a href="/terms" style={s.tosLink}>Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" style={s.tosLink}>Privacy Policy</a>
          </p>
        </div>

      </div>

      <style>{`
  @keyframes sweep {
    0%        { left: -100%; }
    60%, 100% { left: 100%;  }
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── Mobile fixes ── */
  @media (max-width: 640px) {
    .login-left-col {
      order: 2 !important;
    }
    .login-right-col {
      order: 1 !important;
    }
  }
`}</style>
    </main>
  );
}

// ── Security Badge ──────────────────────────────────────────────────────────
function SecBadge({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "5px 10px",
      borderRadius: 6,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
           stroke="rgba(99,179,237,0.8)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

// ── Google Icon ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"
         style={{ flexShrink: 0, position: "relative", zIndex: 1 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {

  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Sora', sans-serif",
    background: "#050d1a",
  },

  canvas: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  // ── Navbar ──
navbar: {
  position: "relative",
  zIndex: 20,
  padding: "24px 24px 0",
  flexShrink: 0,
},

  // ── Grid ──
 wrap: {
  position: "relative",
  zIndex: 10,
  flex: 1,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 40,
  alignItems: "center",
  maxWidth: 1100,
  width: "100%",
  margin: "0 auto",
  padding: "24px 24px 48px",
},

  // ── Left ──
  left: {
    animation: "rise 0.6s ease-out 0.1s both",
  },

  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    color: "#60a5fa",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    marginBottom: 20,
    padding: "6px 14px",
    borderRadius: 999,
    background: "rgba(96,165,250,0.08)",
    border: "1px solid rgba(96,165,250,0.15)",
  },

  tagDot: {
    width: 6, height: 6,
    borderRadius: "50%",
    background: "#60a5fa",
    boxShadow: "0 0 6px #60a5fa",
    animation: "fadeIn 1s ease infinite alternate",
  },

  h1: {
    fontSize: "clamp(32px, 3.5vw, 50px)",
    fontWeight: 800,
    color: "#f1f5f9",
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    marginBottom: 20,
  },

  grad: {
    background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  sub: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 1.75,
    marginBottom: 32,
    maxWidth: 400,
  },

  // Feature list — no cards, just clean checkmarks
  list: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 36px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },

  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  check: {
    width: 20, height: 20,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  listText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: 500,
  },

  // Metrics — inline text, no boxes
  metricsRow: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    paddingTop: 28,
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },

  metricItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 3,
  },

  metricN: {
    fontSize: 22,
    fontWeight: 700,
    color: "#e2e8f0",
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },

  metricL: {
    fontSize: 11,
    color: "#475569",
    fontWeight: 500,
  },

  metricSep: {
    width: 1,
    height: 32,
    background: "rgba(255,255,255,0.08)",
  },

  // ── Right ──
  right: {
    animation: "rise 0.6s ease-out 0.25s both",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },

  card: {
    background: "rgba(15,23,42,0.7)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
  },

  cardAccent: {
    height: 2,
    background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%)",
  },

  cardBody: {
    padding: "40px 40px 36px",
  },

  cardHead: {
    marginBottom: 32,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    color: "#60a5fa",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
    marginBottom: 8,
  },

  cardSub: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.6,
  },

  gBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    padding: "15px 20px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 12,
    textDecoration: "none",
    position: "relative" as const,
    overflow: "hidden",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    cursor: "pointer",
  },

  gBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
  },

  sweep: {
    position: "absolute" as const,
    top: 0, left: "-100%",
    width: "100%", height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
    animation: "sweep 3.5s ease-in-out infinite",
    pointerEvents: "none" as const,
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "24px 0",
  },

  divLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.06)",
  },

  divText: {
    fontSize: 11,
    color: "#1e293b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    whiteSpace: "nowrap" as const,
  },

  secRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
  },

  tos: {
    fontSize: 12,
    color: "#1e293b",
    textAlign: "center" as const,
    lineHeight: 1.7,
  },

  tosLink: {
    color: "#3b82f6",
    textDecoration: "none",
  },
};