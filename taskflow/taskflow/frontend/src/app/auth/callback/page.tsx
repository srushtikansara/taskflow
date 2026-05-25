"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

/**
 * This page receives the OAuth redirect from the backend with:
 *   ?access_token=...&refresh_token=...
 * Stores them in sessionStorage and redirects to the dashboard.
 */
export default function AuthCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken  = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const error        = searchParams.get("msg");

    if (error) {
      toast.error("Authentication failed. Please try again.");
      router.replace("/auth/login");
      return;
    }

    if (accessToken && refreshToken) {
      sessionStorage.setItem("access_token",  accessToken);
      sessionStorage.setItem("refresh_token", refreshToken);
      router.replace("/dashboard");
    } else {
      toast.error("No tokens received. Please try again.");
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
                     flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                        bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg mb-4">
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <p className="text-slate-300 text-sm">Signing you in…</p>
      </div>
    </main>
  );
}
