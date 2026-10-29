export function AdminHeader({ user }: { user: { name: string } }) {
  return (
    <header className="fixed left-64 right-0 top-0 flex h-16 items-center justify-between border-b border-line bg-cream/95 px-6 backdrop-blur">
      <p className="text-[13px] font-semibold text-brand-dark">
        GauDhaam Admin Panel
      </p>
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-body">{user.name}</span>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="text-[13px] font-semibold text-brand hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
