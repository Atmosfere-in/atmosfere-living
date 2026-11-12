import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { user, profile } = await requireUser("/account/profile");
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";
  return (
    <div className="max-w-xl">
      <h2 className="display text-3xl">Profile</h2>
      <p className="mt-2 text-sm text-stone-600">
        Signed in with {provider === "google" ? "Google" : "email"} as {user.email}.
      </p>
      <div className="mt-8">
        <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} />
      </div>
    </div>
  );
}
