import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow – Smart Task Management",
  description: "Collaborate, organise, and ship faster with TaskFlow.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--toast-bg)",
                  color: "var(--toast-color)",
                  borderRadius: "10px",
                  border: "1px solid var(--toast-border)",
                  fontSize: "14px",
                },
                success: {
                  iconTheme: { primary: "#10b981", secondary: "#f8fafc" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#f8fafc" },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}