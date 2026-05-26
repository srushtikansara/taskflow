"use client";
import { useEffect, useRef } from "react";

export default function LoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number;
    }[] = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 179, 237, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99, 179, 237, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="login-page">
      <canvas ref={canvasRef} className="login-canvas" />

      {/* Gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-container">
        {/* Left side — branding */}
        <div className="login-left">
          <div className="brand-mark">
            <div className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <span className="brand-name">TaskFlow</span>
          </div>

          <div className="hero-text">
            <h1 className="hero-title">
              Work smarter,<br />
              <span className="hero-gradient">ship faster.</span>
            </h1>
            <p className="hero-subtitle">
              The intelligent task platform that keeps your team
              aligned, focused, and moving forward.
            </p>
          </div>

          <div className="feature-list">
            {[
              { icon: "⚡", text: "Real-time collaboration" },
              { icon: "🎯", text: "Smart task prioritization" },
              { icon: "📧", text: "Instant email notifications" },
              { icon: "📊", text: "Beautiful analytics" },
            ].map(({ icon, text }) => (
              <div key={text} className="feature-item">
                <span className="feature-icon">{icon}</span>
                <span className="feature-text">{text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="social-proof">
            <div className="avatars">
              {["#f97316","#8b5cf6","#06b6d4","#10b981"].map((c, i) => (
                <div key={i} className="avatar-bubble" style={{ background: c, zIndex: 4 - i }} />
              ))}
            </div>
            <p className="social-text">
              Join <strong>2,400+</strong> teams already using TaskFlow
            </p>
          </div>
        </div>

        {/* Right side — login card */}
        <div className="login-right">
          <div className="login-card">
            <div className="card-header">
              <h2 className="card-title">Welcome back</h2>
              <p className="card-subtitle">Sign in to your workspace</p>
            </div>

            <a href={`${apiUrl}/api/auth/google`} className="google-btn">
              <GoogleIcon />
              <span>Continue with Google</span>
              <div className="btn-shimmer" />
            </a>

            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">Secure sign-in</span>
              <span className="divider-line" />
            </div>

            <div className="security-badges">
              {[
                { icon: "🔒", label: "SSL Encrypted" },
                { icon: "🛡️", label: "OAuth 2.0" },
                { icon: "✓",  label: "SOC 2 Ready" },
              ].map(({ icon, label }) => (
                <div key={label} className="security-badge">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <p className="terms-text">
              By continuing, you agree to our{" "}
              <a href="/terms" className="terms-link">Terms</a>
              {" "}and{" "}
              <a href="/privacy" className="terms-link">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: #020817;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          padding: 20px;
          font-family: 'Sora', sans-serif;
        }

        .login-canvas {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(37,99,235,0.25), transparent 70%);
          top: -200px; left: -200px;
          animation: float1 8s ease-in-out infinite;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%);
          bottom: -150px; right: -150px;
          animation: float2 10s ease-in-out infinite;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%);
          top: 50%; left: 50%;
          animation: float3 12s ease-in-out infinite;
        }

        @keyframes float1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.1); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-40px,-60px) scale(0.9); }
        }
        @keyframes float3 {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50% { transform: translate(-50%,-50%) scale(1.2); }
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        /* ── Left ── */
        .login-left {
          animation: slideInLeft 0.7s ease-out both;
        }
        @keyframes slideInLeft {
          from { opacity:0; transform: translateX(-30px); }
          to   { opacity:1; transform: translateX(0); }
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 48px;
        }
        .brand-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(37,99,235,0.4);
        }
        .brand-name {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .hero-title {
          font-size: clamp(36px, 5vw, 54px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 20px;
        }
        .hero-gradient {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 17px;
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 40px;
          max-width: 420px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 40px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: fadeInUp 0.5s ease-out both;
        }
        .feature-item:nth-child(1) { animation-delay: 0.1s; }
        .feature-item:nth-child(2) { animation-delay: 0.2s; }
        .feature-item:nth-child(3) { animation-delay: 0.3s; }
        .feature-item:nth-child(4) { animation-delay: 0.4s; }

        @keyframes fadeInUp {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .feature-icon {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .feature-text {
          color: #cbd5e1;
          font-size: 15px;
          font-weight: 500;
        }

        .social-proof {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .avatars {
          display: flex;
        }
        .avatar-bubble {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid #020817;
          margin-left: -8px;
        }
        .avatar-bubble:first-child { margin-left: 0; }
        .social-text {
          color: #64748b;
          font-size: 13px;
        }
        .social-text strong { color: #94a3b8; }

        /* ── Right ── */
        .login-right {
          animation: slideInRight 0.7s ease-out both;
        }
        @keyframes slideInRight {
          from { opacity:0; transform: translateX(30px); }
          to   { opacity:1; transform: translateX(0); }
        }

        .login-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5),
                      inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .card-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .card-title {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .card-subtitle {
          color: #64748b;
          font-size: 15px;
        }

        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 24px;
          background: #fff;
          color: #1e293b;
          font-size: 15px;
          font-weight: 600;
          border-radius: 14px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        .google-btn:active { transform: translateY(0); }

        .btn-shimmer {
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% { left: -100%; }
          50%,100% { left: 100%; }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .divider-text {
          color: #475569;
          font-size: 12px;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .security-badges {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 28px;
        }
        .security-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          font-size: 12px;
          font-weight: 500;
        }

        .terms-text {
          text-align: center;
          color: #475569;
          font-size: 12px;
          line-height: 1.6;
        }
        .terms-link {
          color: #60a5fa;
          text-decoration: none;
        }
        .terms-link:hover { text-decoration: underline; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .login-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .login-left {
            text-align: center;
            order: 2;
          }
          .login-right { order: 1; }
          .brand-mark { justify-content: center; }
          .hero-subtitle { margin: 0 auto 32px; }
          .social-proof { justify-content: center; }
          .login-card { padding: 32px 24px; }
          .feature-list { display: none; }
        }

        @media (max-width: 480px) {
          .login-card { padding: 28px 20px; }
          .security-badges { flex-wrap: wrap; gap: 10px; }
        }
      `}</style>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
