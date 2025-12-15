import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const BACKEND_URL = "https://backend-capsule-builder.onrender.com";

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

        const res = await fetch(
          `${BACKEND_URL}/admin/dashboard?token=${encodeURIComponent(token)}`
        );
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
    const raw = (plan || "").trim();
    const normalized = raw.toLowerCase();

    // Nicely formatted label for display
    let label = "None";
    if (normalized === "tier1") label = "Tier 1";
    else if (normalized === "tier2") label = "Tier 2";
    else if (normalized === "pro") label = "Pro";
    else if (normalized === "admin") label = "Admin";

    if (normalized === "admin") {
      return <Badge colorClass="bg-purple-100 text-purple-800">{label}</Badge>;
    }

    if (!normalized || normalized === "none" || normalized === "null") {
      return <Badge colorClass="bg-gray-100 text-gray-700">{label}</Badge>;
    }

    // Tier1 low-uses warning
    const isTier1 = normalized === "tier1";
    if (isTier1 && typeof remainingUses === "number" && remainingUses < 3) {
      return (
        <Badge colorClass="bg-amber-100 text-amber-800 border border-amber-200">
          {label} – Low uses
        </Badge>
      );
    }

    return <Badge colorClass="bg-black text-white">{label}</Badge>;
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
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customer_id");

    if (customerId) {
      navigate(`/capsule-builder?customer_id=${encodeURIComponent(customerId)}`);
    } else {
      navigate("/capsule-builder");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E8E8E8] font-inter text-black">
      {/* Global header (same as Capsule Builder) */}
      <Navbar />

      {/* Admin dashboard header */}
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
                  <th className="px-4 py-3 font-medium whitespace-nowrap">First Name</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Last Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Trial Used</th>
                  <th className="px-4 py-3 font-medium text-center">Plan</th>
                  <th className="px-4 py-3 font-medium text-center whitespace-nowrap">
                    Subscription Status
                  </th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Expiry Date</th>
                  <th className="px-4 py-3 font-medium text-center whitespace-nowrap">
                    Remaining Uses
                  </th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Created Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
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
                          {user.first_name ||
                            (user.full_name || "").split(" ")[0] ||
                            "-"}
                        </span>
                        <span className="text-[11px] text-[#777]">
                          ID: {user.customer_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="font-medium text-[13px]">
                        {user.last_name ||
                          (user.full_name || "").split(" ").slice(1).join(" ") ||
                          "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-[13px]">{user.email || "-"}</span>
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      {user.trial_used ? (
                        <Badge colorClass="bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Used
                        </Badge>
                      ) : (
                        <Badge colorClass="bg-white text-gray-700 border border-gray-300">
                          Not used
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      {renderPlanBadge(user.plan, user.remaining_uses)}
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      {renderStatusBadge(user)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {formatDate(user.expiry)}
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      {typeof user.remaining_uses === "number" ? (
                        <span
                          className={
                            user.remaining_uses > 0 && user.remaining_uses < 3
                              ? "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[12px] bg-amber-50 text-amber-800 border border-amber-200"
                              : "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[12px] bg-gray-100 text-gray-800"
                          }
                        >
                          {user.remaining_uses}
                        </span>
                      ) : (
                        "-"
                      )}
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

      {/* Footer (same as Capsule Builder landing) */}
      <footer className="w-full background-color:rgb(var(--color-background)) font-ebgaramond py-16 px-12 text-[#22211C] text-[17px]">
        <div className="footer__top-wrapper flex flex-col md:flex-row justify-between gap-8 md:gap-14 px-4 md:px-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" fill="none" stroke="currentColor">
                <path
                  d="M2.5 4.375H17.5V15C17.5 15.1658 17.4342 15.3247 17.3169 15.4419C17.1997 15.5592 17.0408 15.625 16.875 15.625H3.125C2.95924 15.625 2.80027 15.5592 2.68306 15.4419C2.56585 15.3247 2.5 15.1658 2.5 15V4.375Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.5 4.375L10 11.25L2.5 4.375"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>info@formdepartment.com</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="20" fill="none" stroke="currentColor">
                <path
                  d="M15 16.875L15 3.125C15 2.464 14.4404 1.875 13.75 1.875H6.25C5.55964 1.875 5 2.464 5 3.125L5 16.875C5 17.5654 5.55964 18.125 6.25 18.125H13.75C14.4404 18.125 15 17.5654 15 16.875Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 5.625C10.5178 5.625 10.9375 5.20527 10.9375 4.6875C10.9375 4.16973 10.5178 3.75 10 3.75C9.48223 3.75 9.0625 4.16973 9.0625 4.6875C9.0625 5.20527 9.48223 5.625 10 5.625Z"
                  fill="currentColor"
                />
              </svg>
              <span>+1 213 265 7977</span>
            </div>
          </div>
        </div>

        <br />
        <br />

        <div className="footer__bottom page-width mt-10 px-4 md:px-10 text-[#22211C] font-[EB Garamond] text-[17px] flex flex-col gap-6">
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/formdepartment"
              aria-label="Facebook"
              className="text-black hover:opacity-70 transition"
            >
              <i className="fab fa-facebook-f text-lg"></i>
            </a>
            <a
              href="https://www.instagram.com/formdepartment/"
              aria-label="Instagram"
              className="text-black hover:opacity-70 transition"
            >
              <i className="fab fa-instagram text-lg"></i>
            </a>
          </div>

          <div className="footer__bottom-row flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <p className="whitespace-nowrap text-left w-full md:w-auto">
              © 2025 <a href="/">Form Department</a>
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[17px] w-full md:justify-end md:w-auto">
              {[
                { label: "Policies", href: "/pages/policies" },
                { label: "Client Form", href: "/pages/client-form" },
                { label: "Item Form", href: "/pages/item-form-1" },
                { label: "Adjustment Form", href: "/pages/adjustment-form-1" },
                { label: "Labels & Packaging", href: "/pages/labels-packaging-1" },
                { label: "Printing & Embroidery", href: "/pages/printing-embroidery-1" },
                { label: "FAQ", href: "/pages/faq" },
              ].map(({ label, href }, idx) => (
                <a key={idx} href={href} className="relative group transition inline-block">
                  <span className="pb-1 hover-line">{label}</span>
                </a>
              ))}
            </div>
          </div>

          <style>{`
            .hover-line {
              position: relative;
              display: inline-block;
            }
            .hover-line::after {
              content: "";
              position: absolute;
              left: 0;
              bottom: -2px;
              width: 100%;
              height: 1px;
              background-color: black;
              transform: scaleX(0);
              transform-origin: left;
              transition: transform 0.3s ease;
            }
            .hover-line:hover::after {
              transform: scaleX(1);
              transform-origin: left;
            }
          `}</style>
        </div>
      </footer>
    </div>
  );
}


