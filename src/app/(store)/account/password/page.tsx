import { requireUser } from "@/lib/auth";
import { PasswordForm } from "@/components/account/PasswordForm";

export const metadata = { title: "Password" };

export default async function PasswordPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { reset } = await searchParams;
  await requireUser("/account/password");
  return (
    <div className="max-w-xl">
      <h2 className="display text-3xl">{reset ? "Set a new password" : "Password"}</h2>
      <p className="mt-2 text-sm text-stone-600">
        {reset
          ? "Choose a new password for your account."
          : "Set or change the password you use to sign in with your email. Google sign-in keeps working either way."}
      </p>
      <div className="mt-8">
        <PasswordForm />
      </div>
    </div>
  );
}
