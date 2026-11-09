import { AuthForgotForm } from "@/components/auth/auth-forgot-form";

export const metadata = {
  title: "Reset password | GauDhaam",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-[420px] px-4 py-12">
      <h1 className="text-[26px] font-semibold">Reset your password</h1>
      <p className="mt-2 text-[13px] text-body/70">Enter your email to receive a verification code.</p>
      <AuthForgotForm />
    </div>
  );
}
