"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Section from "@/components/Section";

type Staff = { _id: string; name: string; email: string };
type Action = { id: string; name: string } | null;

const label = (value: string) => value.replaceAll("_", " ");
const urgencyClass = (value: string) =>
  value === "high" || value === "critical"
    ? "pill bg-red-500/15 text-red-200"
    : "pill";
const statusClass = (value: string) =>
  value === "resolved"
    ? "pill bg-green-500/15 text-green-200"
    : value === "rejected"
      ? "pill bg-red-500/20 text-red-200"
      : value === "assigned" || value === "in_progress"
        ? "pill bg-blue-500/15 text-blue-200"
        : "pill";

export default function AdminCrisis() {
  const [rows, setRows] = useState<any[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [action, setAction] = useState<Action>(null);
  const [error, setError] = useState("");

  const load = async () => {
    const [reports, admin] = await Promise.all([
      fetch("/api/crisis"),
      fetch("/api/admin"),
    ]);
    const reportData = await reports.json();
    const adminData = await admin.json();
    if (!reports.ok)
      throw new Error(reportData.message || "Could not load reports");
    if (!admin.ok) throw new Error(adminData.message || "Could not load staff");
    setRows(reportData.reports || []);
    setStaff(adminData.staff || []);
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const runAction = async (id: string, name: string) => {
    setAction({ id, name });
    setError("");
    try {
      let endpoint = `/api/crisis/${id}/status`;
      let body: { status?: string; staffId?: string };
      if (name === "review") {
        endpoint = `/api/crisis/${id}/verify`;
        body = {};
      } else if (name === "assign") {
        const staffId = selected[id] || staff[0]?._id;
        if (!staffId)
          throw new Error("Add staff account before assigning report");
        endpoint = `/api/crisis/${id}/assign`;
        body = { staffId };
      } else {
        body = { status: name };
      }
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Action failed");
      await load();
    } catch (e: any) {
      setError(e.message || "Action failed");
    } finally {
      setAction(null);
    }
  };

  return (
    <Section
      title="Crisis Desk management"
      subtitle="Review, assign, and resolve incoming emergency reports."
    >
      <div className="space-y-3">
        {error && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
        {rows.map((report) => (
          <div className="card p-5" key={report._id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/crisis/track?code=${report.trackingCode}`}
                  className="font-black text-blue-300"
                >
                  {report.trackingCode}
                </Link>
                <h3 className="mt-1 font-bold">{report.summary}</h3>
                <p className="muted text-sm">{report.location}</p>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <span className={urgencyClass(report.urgency)}>
                  {label(report.urgency)}
                </span>
                <span className={statusClass(report.status)}>
                  {label(report.status)}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {staff.length > 0 && (
                <select
                  className="input max-w-xs"
                  value={selected[report._id] || staff[0]._id}
                  onChange={(e) =>
                    setSelected({ ...selected, [report._id]: e.target.value })
                  }
                >
                  <option value="">Select staff</option>
                  {staff.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="btn btn-ghost"
                disabled={!!action}
                onClick={() => runAction(report._id, "review")}
              >
                Review
              </button>
              <button
                className="btn btn-ghost"
                disabled={!!action}
                onClick={() => runAction(report._id, "assign")}
              >
                Assign
              </button>
              <button
                className="btn btn-primary"
                disabled={!!action}
                onClick={() => runAction(report._id, "resolved")}
              >
                Resolve
              </button>
              <button
                className="btn btn-danger"
                disabled={!!action}
                onClick={() => runAction(report._id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
