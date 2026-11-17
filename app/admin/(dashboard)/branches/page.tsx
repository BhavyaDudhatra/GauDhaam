import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/firebase";
import { BranchManager } from "@/components/admin/branch-manager";

export const metadata: Metadata = { title: "Branches · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  await requireAdmin();
  const db = await getDb();
  let branches: any[] = [];
  if (db) {
    try {
      const snap = await db.collection('branches').orderBy('createdAt', 'desc').get();
      branches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      const snap = await db.collection('branches').get();
      branches = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[22px]">Branches</h1>
      <p className="mt-1 text-[13px] text-body">Manage delivery branches. Mark one as Main for distance calculations.</p>
      <BranchManager branches={branches} />
    </div>
  );
}
