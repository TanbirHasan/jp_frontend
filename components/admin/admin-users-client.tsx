"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { adminApi } from "@/lib/api";
import type { User } from "@/lib/types";

export function AdminUsersClient() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {(user) => <AdminUsersContent user={user} />}
    </ProtectedRoute>
  );
}

function AdminUsersContent({ user }: { user: User }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    adminApi.users().then(setUsers).catch(() => setUsers([]));
  }, []);

  async function deactivate(id: string) {
    await adminApi.deactivateUser(id);
    setUsers((current) =>
      current.map((item) =>
        String(item.id) === id ? { ...item, is_active: false } : item,
      ),
    );
  }

  return (
    <AppShell user={user} title="Users" description="View and deactivate platform users.">
      <div className="grid gap-4">
        {users.map((item) => (
          <article key={item.id} className="border border-[#dfe5dc] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-[#626971]">
                  {item.email} · {item.role.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={() => deactivate(String(item.id))}
                className="border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
              >
                Deactivate
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
