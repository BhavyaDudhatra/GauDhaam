"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  isMain: boolean;
};

export function BranchManager({ branches: initialBranches }: { branches: Branch[] }) {
  const [branches, setBranches] = useState(initialBranches);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Branch>>({});
  const [saving, setSaving] = useState(false);

  function startEdit(branch: Branch) {
    setEditingId(branch.id);
    setEditData({ ...branch });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("id", editingId);
      form.append("name", editData.name || "");
      form.append("address", editData.address || "");
      form.append("lat", String(editData.lat || 0));
      form.append("lng", String(editData.lng || 0));
      form.append("phone", editData.phone || "");
      form.append("isMain", String(editData.isMain || false));

      const res = await fetch("/api/admin/branches/update", { method: "POST", body: form });
      if (res.ok) {
        setBranches((prev) =>
          prev.map((b) => (b.id === editingId ? { ...b, ...editData } as Branch : b))
        );
        setEditingId(null);
        setEditData({});
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function deleteBranch(id: string) {
    if (!confirm("Delete this branch?")) return;
    const form = new FormData();
    form.append("id", id);
    await fetch("/api/admin/branches/delete", { method: "POST", body: form });
    setBranches((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Add Branch Form */}
      <div className="card p-5">
        <h2 className="text-[16px] mb-3">Add New Branch</h2>
        <form method="post" action="/api/admin/branches" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="field">
              <span className="label">Name</span>
              <input name="name" required className="input" />
            </label>
            <label className="field">
              <span className="label">Phone</span>
              <input name="phone" className="input" />
            </label>
          </div>
          <label className="field">
            <span className="label">Address</span>
            <textarea name="address" required className="textarea" rows={2} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="field">
              <span className="label">Latitude</span>
              <input name="lat" type="number" step="any" required className="input" />
            </label>
            <label className="field">
              <span className="label">Longitude</span>
              <input name="lng" type="number" step="any" required className="input" />
            </label>
          </div>
          <label className="field">
            <span className="label">Is Main</span>
            <select name="isMain" className="input">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary btn-sm">
            <Plus size={15} />
            Add Branch
          </button>
        </form>
      </div>

      {/* Branches Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-[0.08em] text-body/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Address</th>
                <th className="px-4 py-3 font-semibold">Latitude</th>
                <th className="px-4 py-3 font-semibold">Longitude</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Main</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {branches.map((branch) => (
                <tr key={branch.id} className="align-middle">
                  {editingId === branch.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editData.name || ""}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="input input-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          value={editData.address || ""}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          className="textarea input-sm"
                          rows={2}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="any"
                          value={editData.lat || 0}
                          onChange={(e) => setEditData({ ...editData, lat: parseFloat(e.target.value) })}
                          className="input input-sm w-24"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="any"
                          value={editData.lng || 0}
                          onChange={(e) => setEditData({ ...editData, lng: parseFloat(e.target.value) })}
                          className="input input-sm w-24"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editData.phone || ""}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="input input-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={editData.isMain ? "true" : "false"}
                          onChange={(e) => setEditData({ ...editData, isMain: e.target.value === "true" })}
                          className="select input-sm"
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={saving}
                            className="grid h-7 w-7 place-items-center rounded-md text-brand hover:bg-light"
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="grid h-7 w-7 place-items-center rounded-md text-body/70 hover:bg-light"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 font-semibold text-brand-dark">{branch.name}</td>
                      <td className="px-3 py-2 text-body text-[11.5px]">{branch.address}</td>
                      <td className="px-3 py-2 text-body">{branch.lat}</td>
                      <td className="px-3 py-2 text-body">{branch.lng}</td>
                      <td className="px-3 py-2 text-body">{branch.phone || "—"}</td>
                      <td className="px-3 py-2">
                        {branch.isMain ? (
                          <span className="badge badge-green">Main</span>
                        ) : (
                          <span className="badge badge-neutral">No</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(branch)}
                            className="grid h-7 w-7 place-items-center rounded-md text-brand hover:bg-light"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBranch(branch.id)}
                            className="grid h-7 w-7 place-items-center rounded-md text-brown hover:bg-light"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-body">
                    No branches yet. Add one above.
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
