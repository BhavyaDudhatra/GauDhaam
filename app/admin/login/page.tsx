import { Logo } from "@/components/site/logo";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md overflow-hidden rounded-banner border border-line bg-white">
        <div className="flex flex-col items-center border-b border-line px-6 py-8 text-center">
          <Logo />
          <h1 className="mt-4 text-[22px]">Admin sign in</h1>
          <p className="mt-1 text-[13px] text-body">
            Only the authorised team can access this panel
          </p>
        </div>
        <form action="/api/auth/admin-login" method="post" className="space-y-4 p-6">
          <label className="field">
            <span className="label">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              placeholder="admin@gaudham.in"
            />
          </label>
          <label className="field">
            <span className="label">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              placeholder="Enter your password"
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block">
            Sign in to admin panel
          </button>
          <Link
            href="/"
            className="block text-center text-[12.5px] font-semibold text-brand hover:underline"
          >
            Back to storefront
          </Link>
        </form>
      </div>
    </div>
  );
}
