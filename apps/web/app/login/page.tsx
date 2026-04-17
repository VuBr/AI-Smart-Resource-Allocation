"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { login } from "@/lib/services/auth";
import { BrandPanel } from "@/components/auth/BrandPanel";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import { LoginForm } from "@/components/auth/LoginForm";

const inter = Inter({ subsets: ["latin"] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch {
      setError("The email or password you entered is incorrect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`flex min-h-screen ${inter.className}`} style={{ minWidth: "1280px" }}>
      <BrandPanel />

      {/* Right panel */}
      <div className="flex flex-1 flex-col justify-center bg-slate-50 px-8 py-12 sm:px-16 lg:px-20">
        <div className="mx-auto w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-x-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <svg
                className="h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"
                />
              </svg>
            </div>
            <p className="text-base font-bold text-slate-900">ResourceAI</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to your ResourceAI account to continue.
            </p>
          </div>

          {/* Error alert */}
          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {/* Login form */}
          <LoginForm
            email={email}
            password={password}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />

          {/* Footer */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-center text-xs text-slate-400">
              Protected by enterprise SSO ·{" "}
              <a href="#" className="text-indigo-500 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
