"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import Topbar from "@/components/Topbar";
import { Camera, LogOut, MapPin, Mail, Phone, ShieldCheck, User2, X } from "lucide-react";
import { toast } from "sonner";
/* ---------- Skeleton ---------- */
function ProfileSkeleton() {
  return (
    <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-8">
      <div className="card overflow-hidden rounded-2xl border border-slate-100 shadow-md">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="h-5 w-28 rounded bg-slate-100 animate-pulse" />
            <div className="mt-2 h-3 w-64 max-w-full rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="h-9 w-full sm:w-28 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-9 w-full sm:w-32 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[260px,1fr] lg:gap-10">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 animate-pulse sm:h-32 sm:w-32" />
            <div className="mt-3 h-3 w-44 rounded bg-slate-100 animate-pulse" />
          </div>

          {/* Fields */}
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
              </div>
            ))}

            {/* Security */}
            <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />
                  <div className="min-w-0">
                    <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                    <div className="mt-2 h-3 w-64 max-w-full rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
                <div className="h-9 w-full sm:w-36 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load profile data
  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        if (!alive) return;

        setFullName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setAvatarPreview(data.image || null);
      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, []);

  // Avatar upload
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) setAvatarPreview(data.url);
  };

  // Save profile
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      name: fullName,
      phone,
      address,
      image: avatarPreview || "",
    };

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });



    toast.success("Profile updated successfully!");
  };

  // Change password
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await fetch("/api/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      toast.success("Password updated successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to update password");
    }
  };

  const handleSignOut = () => signOut({ callbackUrl: "/signin", redirect: true });

  const initials =
    (fullName || session?.user?.name || "SE")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (loading) {
    return (
      <main className="w-full">
        <Topbar title="Profile" />
        <ProfileSkeleton />
      </main>
    );
  }

  return (
    <main className="w-full">
      <Topbar title="Profile" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-8">
        <div className="card overflow-hidden rounded-2xl border border-slate-100 shadow-md">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                Your account
              </h2>
              <p className="text-xs text-slate-500">
                Manage your personal information and security settings.
              </p>
            </div>

            {/* Buttons: stacked on mobile */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:w-auto sm:px-3 sm:py-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>

              <button
                type="submit"
                form="profile-form"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 sm:w-auto sm:py-1.5"
              >
                Save changes
              </button>
            </div>
          </div>

          {/* Body */}
          <form
            id="profile-form"
            onSubmit={handleSave}
            className="grid gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[260px,1fr] lg:gap-10"
          >
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-2xl font-semibold text-white shadow-md sm:h-32 sm:w-32 sm:text-4xl"
                aria-label="Upload avatar"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}

                <span className="absolute bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-500 shadow">
                  <Camera className="h-4 w-4" />
                </span>
              </button>

              <p className="mt-3 text-xs text-slate-500">Click to upload a new photo</p>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Fields */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Full name</label>
                <div className="relative">
                  <User2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Required. Your full display name.</p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    value={email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Phone</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+222..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Optional. Contact phone number.</p>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Address</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, Country"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Optional. City or physical address.</p>
              </div>

              {/* Security */}
              <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Security</h3>
                      <p className="text-xs text-slate-500">
                        Change your password to protect your account.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium text-emerald-600 shadow-sm hover:bg-emerald-50 sm:w-auto sm:py-1.5"
                  >
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">Change Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="New password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-full rounded-full bg-slate-200 px-4 py-2 text-xs font-medium text-slate-700 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="w-full rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white sm:w-auto"
              >
                Confirm
              </button>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              Tip: use a strong password (12+ chars, mixed case, numbers, symbols).
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

