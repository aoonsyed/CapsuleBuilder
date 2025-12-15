import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Simple badge component following Capsule Builder typography + spacing
function Badge({ children, colorClass = "bg-gray-100 text-gray-800", extra = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-inter font-medium leading-[140%] ${colorClass} ${extra}`}
    >
      {children}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setError("Missing admin token in URL.");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/admin/dashboard?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data?.message || "Unable to load admin dashboard.");
        }

        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        console.error("Admin dashboard error:", err);
        setError(err.message || "Unexpected error loading dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.full_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search]);

  const metrics = useMemo(() => {
    const total = users.length;
    let trialUsed = 0;
    let activeSubs = 0;
    let expiredSubs = 0;

    const now = new Date();

    users.forEach((u) => {
      if (u.trial_used) trialUsed += 1;

      const expiry = u.expiry ? new Date(u.expiry) : null;
      const isExpired = expiry && expiry < now;
      const isActive = u.subscription_active && !isExpired;

      if (isActive) activeSubs += 1;
      if (!isActive && expiry) expiredSubs += 1;
    });

    return { total, trialUsed, activeSubs, expiredSubs };
  }, [users]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPlanBadge = (plan, remainingUses) => {
    const normalized = (plan || "").trim();

    if (normalized === "Admin") {
      return <Badge colorClass="bg-purple-100 text-purple-800">Admin</Badge>;
    }

    if (normalized === "None" || !normalized) {
      return <Badge colorClass="bg-gray-100 text-gray-700">None</Badge>;
    }

    // Tier low-uses warning
    const isTier1 = normalized === "Tier1";
    if (isTier1 && typeof remainingUses === "number" && remainingUses < 3) {
      return (
        <Badge colorClass="bg-amber-100 text-amber-800 border border-amber-200">
          {normalized} – Low uses
        </Badge>
      );
    }

    return <Badge colorClass="bg-black text-white">{normalized}</Badge>;
  };

  const renderStatusBadge = (user) => {
    const expiryDate = user.expiry ? new Date(user.expiry) : null;
    const isExpired = expiryDate && expiryDate < new Date();
    const isActive = user.subscription_active && !isExpired;

    if (isActive) {
      return <Badge colorClass="bg-emerald-100 text-emerald-800 border border-emerald-200">Active</Badge>;
    }

    if (isExpired) {
      return <Badge colorClass="bg-red-100 text-red-800 border border-red-200">Expired</Badge>;
    }

    return <Badge colorClass="bg-gray-100 text-gray-700">Inactive</Badge>;
  };

  const handleBackToCapsule = () => {
    navigate("/capsule-builder");
  };

  return (
    <div className="min-h-screen w-full bg-[#E8E8E8] font-inter text-black">
      {/* Top header */}
      <header className="w-full border-b border-[#E0E0E0] bg-[#E8E8E8]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-sf-pro font-semibold text-[26px] sm:text-[30px] leading-[120%] tracking-[-0.2%]">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-[13px] sm:text-[14px] text-[#555]">
              Monitor Capsule Builder users, trials, and subscriptions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBackToCapsule}
              className="inline-flex items-center justify-center px-4 py-2 rounded-[999px] border border-black/10 bg-white text-[13px] font-medium hover:bg-black/5 transition"
            >
              Back to Capsule Builder
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#E4E4E4] px-4 py-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[12px] font-medium text-[#555] uppercase tracking-[0.08em]">
              Total users
            </span>
            <span className="text-[24px] font-sf-pro font-semibold leading-[120%]">
              {metrics.total}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E4E4] px-4 py-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[12px] font-medium text-[#555] uppercase tracking-[0.08em]">
              Trial used
            </span>
            <span className="text-[24px] font-sf-pro font-semibold leading-[120%]">
              {metrics.trialUsed}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E4E4] px-4 py-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[12px] font-medium text-[#555] uppercase tracking-[0.08em]">
              Active subscriptions
            </span>
            <span className="text-[24px] font-sf-pro font-semibold leading-[120%] text-emerald-700">
              {metrics.activeSubs}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E4E4] px-4 py-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[12px] font-medium text-[#555] uppercase tracking-[0.08em]">
              Expired subscriptions
            </span>
            <span className="text-[24px] font-sf-pro font-semibold leading-[120%] text-red-700">
              {metrics.expiredSubs}
            </span>
          </div>
        </section>

        {/* Controls */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <label className="block text-[12px] font-medium text-[#555] mb-1">
              Search by name or email
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Start typing to filter users…"
                className="w-full rounded-[999px] border border-[#D4D4D4] bg-white px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#999]">
                {/* search icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z"
                  />
                </svg>
              </span>
            </div>
          </div>

          {loading && (
            <span className="text-[13px] text-[#555]">Loading dashboard…</span>
          )}
          {!loading && error && (
            <span className="text-[13px] text-red-600">{error}</span>
          )}
        </section>

        {/* Table */}
        <section className="bg-white rounded-2xl border border-[#E4E4E4] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-[#F5F5F5] text-[#555] font-medium">
                <tr>
                  <th className="px-4 py-3 font-medium">Full Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Trial Used</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Subscription Status</th>
                  <th className="px-4 py-3 font-medium">Expiry Date</th>
                  <th className="px-4 py-3 font-medium">Remaining Uses</th>
                  <th className="px-4 py-3 font-medium">Created Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-[13px] text-[#777]"
                    >
                      {loading
                        ? "Loading users…"
                        : error
                        ? "Unable to load users."
                        : "No users match your search."}
                    </td>
                  </tr>
                )}

                {filteredUsers.map((user) => (
                  <tr
                    key={user.customer_id}
                    className="border-t border-[#F0F0F0] hover:bg-[#FAFAFA]"
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium text-[13px]">
                          {user.full_name || "-"}
                        </span>
                        <span className="text-[11px] text-[#777]">
                          ID: {user.customer_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-[13px]">{user.email || "-"}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {user.trial_used ? (
                        <Badge colorClass="bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Used
                        </Badge>
                      ) : (
                        <Badge colorClass="bg-gray-100 text-gray-700">
                          Not used
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {renderPlanBadge(user.plan, user.remaining_uses)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {renderStatusBadge(user)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {formatDate(user.expiry)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {typeof user.remaining_uses === "number"
                        ? user.remaining_uses
                        : "-"}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}


