import { PageHeader } from "@/components/admin/ui";
import { PasswordForm } from "@/components/account/PasswordForm";

export const metadata = { title: "Password" };

export default async function AdminPasswordPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { reset } = await searchParams;
  return (
    <div className="max-w-xl">
      <PageHeader
        title={reset ? "Set a new password" : "Password"}
        subtitle={reset ? "Choose a new password for your admin account." : "Change the password you use at /admin/login."}
      />
      <PasswordForm />
    </div>
  );
}
