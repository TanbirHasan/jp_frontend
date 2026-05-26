"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { adminApi } from "@/lib/api";
import type { User, UserRole } from "@/lib/types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "job_seeker", label: "Job Seeker" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Admin" },
];

const roleBadge: Record<UserRole, string> = {
  job_seeker: "bg-blue-100 text-blue-700",
  employer: "bg-emerald-100 text-emerald-700",
  admin: "bg-violet-100 text-violet-700",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminUsersClient() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {(user) => <AdminUsersContent currentUser={user} />}
    </ProtectedRoute>
  );
}

function AdminUsersContent({ currentUser }: { currentUser: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    adminApi
      .users()
      .then(setUsers)
      .catch(() => {
        setUsers([]);
        toast.error("Failed to load users.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id: string, role: UserRole) {
    setRoleLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await adminApi.updateUserRole(id, role);
      setUsers((prev) =>
        prev.map((u) => (String(u.id) === id ? { ...u, role } : u)),
      );
      toast.success("Role updated.");
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setRoleLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(String(deleteTarget.id));
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} deleted.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <AppShell
      user={currentUser}
      title="Users"
      description="Manage all platform users — change roles or remove accounts."
    >
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Joined</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const id = String(u.id);
                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge[u.role]}`}
                      >
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          disabled={roleLoading[id]}
                          onChange={(e) => handleRoleChange(id, e.target.value as UserRole)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete user"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </AppShell>
  );
}
