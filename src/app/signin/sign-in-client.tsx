"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Apple, Facebook, Mail, Lock, ShieldCheck, ChevronRight } from "lucide-react";

/* ---------- Decorative Helpers ---------- */
function WaveTexture() {
  return (
    <svg
      viewBox="0 0 1440 320"
      className="pointer-events-none absolute inset-x-0 top-0 h-full w-full opacity-[0.26]"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="w" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        fill="url(#w)"
        d="M0,160L40,144C80,128,160,96,240,96C320,96,400,128,480,154.7C560,181,640,203,720,208C800,213,880,203,960,176C1040,149,1120,107,1200,112C1280,117,1360,171,1400,197.3L1440,224L1440,0L0,0Z"
      />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.85-.07-1.47-.22-2.11H12v3.83h6.53c-.13.95-.83 2.39-2.39 3.36l-.02.11 3.47 2.69.24.02c2.2-2.03 3.66-5.02 3.66-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.31 0 6.09-1.09 8.12-2.97l-3.87-3c-1.04.72-2.46 1.22-4.25 1.22-3.25 0-6.01-2.18-7-5.14l-.12.01-3.78 2.92-.05.11C3.05 21.53 7.18 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5 13.11A7.98 7.98 0 0 1 4.56 11c0-.73.13-1.45.35-2.11l-.01-.14-3.83-2.97-.13.06A12.001 12.001 0 0 0 0 11c0 1.96.47 3.82 1.3 5.45L5 13.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.74c2.3 0 3.86.98 4.75 1.8l3.47-3.39C18.07 1.03 15.31 0 12 0 7.18 0 3.05 2.47 1.16 5.75l3.75 2.99C5.9 6.78 8.76 4.74 12 4.74Z"
      />
    </svg>
  );
}

function SocialButton({
  onClick,
  children,
  disabled,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 shadow-sm transition hover:bg-white disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function TinySwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2 text-[11px] text-gray-600 select-none"
      aria-pressed={checked}
    >
      <span
        className={`h-3.5 w-6 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`ml-[2px] mt-[2px] block h-2.5 w-2.5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-3" : ""
          }`}
        />
      </span>
      {label}
    </button>
  );
}

/* ---------- Page (client) ---------- */
export default function SignInClient({
  callbackUrl,
  error,
}: {
  callbackUrl: string;
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(error);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signIn("credentials", {
        email,
        password: pwd,
        redirect: true,
        callbackUrl,
      });
    } catch {
      setErr("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const oauth = (provider: "google" | "apple" | "facebook") => {
    setErr(null);
    setLoading(true);
    signIn(provider, { callbackUrl, redirect: true }).catch(() => {
      setLoading(false);
      setErr("Could not start social sign-in.");
    });
  };

  return (
    // ✅ Mobile-safe height + safe padding + no sideways overflow
    <main className="min-h-dvh bg-slate-50 px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* ✅ Hero: smaller on mobile, more compact paddings, still centered */}
        <div className="relative mb-6 sm:mb-10 rounded-3xl bg-gradient-to-r from-emerald-400 via-[#3EC6B7] to-emerald-500 p-5 sm:p-10 shadow-[0_18px_45px_rgba(15,23,42,0.35)] overflow-hidden">
          <WaveTexture />

          <div className="relative flex flex-col items-center text-center gap-2 text-white">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em]">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-300" />
              SANAMED
            </span>

            <h1 className="text-xl sm:text-3xl font-semibold leading-tight">
              Welcome back!
            </h1>

            <p className="max-w-xl text-[11px] sm:text-sm text-emerald-50/90">
              Sign in to access your SanaMed dashboard, manage patients, and track appointments.
            </p>
          </div>
        </div>

        {/* ✅ Card: full width on mobile, fixed max on larger screens */}
        <div className="mx-auto w-full max-w-xl rounded-3xl bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.16)] border border-slate-100">
          <div className="px-4 pt-5 pb-2 sm:px-8 sm:pt-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Sign in to your account
                </h2>
                <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
                  Use your work email and password.{" "}
                  <span className="text-emerald-600 font-medium">
                    It only takes a moment.
                  </span>
                </p>
              </div>
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            {/* Social row */}
            <p className="mt-5 sm:mt-6 text-center text-[11px] text-gray-500">
              Sign in with
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <SocialButton
                label="Sign in with Facebook"
                onClick={() => oauth("facebook")}
                disabled={loading}
              >
                <Facebook className="h-4 w-4" />
              </SocialButton>
              <SocialButton
                label="Sign in with Apple"
                onClick={() => oauth("apple")}
                disabled={loading}
              >
                <Apple className="h-4 w-4" />
              </SocialButton>
              <SocialButton
                label="Sign in with Google"
                onClick={() => oauth("google")}
                disabled={loading}
              >
                <GoogleMark />
              </SocialButton>
            </div>

            {/* divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] text-gray-500">
                  or sign in with email
                </span>
              </div>
            </div>

            {/* error */}
            {err && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {err === "CredentialsSignin" ? "Invalid credentials" : err}
              </div>
            )}

            {/* form */}
            <form onSubmit={submit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] text-slate-900 outline-none shadow-sm focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  required
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-14 text-[13px] text-slate-900 outline-none shadow-sm focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot (stack on very small screens) */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500">
                <TinySwitch checked={remember} onChange={setRemember} label="Remember me" />
                <button
                  type="button"
                  className="text-emerald-600 font-medium hover:text-emerald-700 text-left sm:text-right"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-60"
              >
                <span>{loading ? "Signing in…" : "Sign in"}</span>
                {!loading && <ChevronRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-4 mb-6 text-[11px] text-center text-slate-400 px-2">
              Don&apos;t have an account yet?{" "}
              <span className="text-emerald-600 font-medium hover:underline cursor-pointer">
                Contact the clinic administrator
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
