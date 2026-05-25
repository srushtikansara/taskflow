import Link from "next/link";

export default function LoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
                     flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">TaskFlow</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Your team's intelligent task hub
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white text-center mb-1">
            Welcome back
          </h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            Sign in to continue to your dashboard
          </p>

          {/* Google OAuth button */}
          <a
            href={`${apiUrl}/api/auth/google`}
            className="flex items-center justify-center gap-3 w-full py-3 px-4
                       bg-white text-slate-800 font-semibold rounded-xl
                       hover:bg-slate-50 active:bg-slate-100
                       transition-all duration-150 shadow-md hover:shadow-lg
                       border border-slate-200 group"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </a>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs leading-relaxed">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: "⚡", label: "Fast & Intuitive" },
            { icon: "🔒", label: "Secure & Private" },
            { icon: "🤝", label: "Team Collaboration" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
            >
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-slate-400 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
