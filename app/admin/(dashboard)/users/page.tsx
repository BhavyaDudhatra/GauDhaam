import type { Metadata } from "next";
import { ShieldCheck, User } from "lucide-react";
import { formatDateTime } from "@/lib/money";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Users · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const store = await getStore();
  const users = await store.users.list();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">Users</h1>
        <p className="mt-1 text-[13px] text-body">
          {users.length} accounts
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-light text-brand">
                        {user.role === "admin" ? <ShieldCheck size={16} /> : <User size={16} />}
                      </span>
                      <div>
                        <p className="font-semibold text-brand-dark">{user.name}</p>
                        <p className="text-[11px] text-body/70">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body">{user.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.role === "admin" ? "badge-green" : "badge-neutral"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body">
                    {user.emailVerified ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-body">{formatDateTime(user.createdAt)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-body">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
