"use client";

import { deleteUser } from "@/lib/actions/admin";

type Props = {
  userId: string;
  userName: string;
  canDelete: boolean;
};

export function DeleteUserButton({ userId, userName, canDelete }: Props) {
  if (!canDelete) return null;
  return (
    <form action={deleteUser}>
      <input type="hidden" name="id" value={userId} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Delete user "${userName}"? This action cannot be undone.`)) {
            e.preventDefault();
          }
        }}
        className="text-[12px] font-semibold text-brown hover:underline"
      >
        Delete
      </button>
    </form>
  );
}
