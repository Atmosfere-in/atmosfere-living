import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Panel, Table, Td, Empty, FilterTabs } from "@/components/admin/ui";
import { UserControls } from "@/components/admin/UserControls";
import type { Profile } from "@/lib/types";
import { fmtDate, inr } from "@/lib/utils";

export const metadata = { title: "Customers" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const { role, q } = await searchParams;
  const { user: me } = await requireAdmin();
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
  if (role === "admin" || role === "customer") query = query.eq("role", role);
  if (role === "blocked") query = query.eq("is_blocked", true);
  if (q) query = query.or(`email.ilike.%${q.replace(/[%,()]/g, "")}%,full_name.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const [{ data }, { data: orders }] = await Promise.all([query, supabase.from("orders").select("user_id, total, status")]);
  const users = (data as Profile[]) ?? [];

  const stats = new Map<string, { count: number; spent: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id || o.status === "cancelled") continue;
    const s = stats.get(o.user_id) ?? { count: 0, spent: 0 };
    s.count++;
    s.spent += Number(o.total);
    stats.set(o.user_id, s);
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${users.length} accounts`} />
      <form className="mb-4 flex gap-3">
        {role && <input type="hidden" name="role" value={role} />}
        <input name="q" defaultValue={q} placeholder="Search name or email" className="field !min-h-10 max-w-xs" />
        <button className="btn btn-outline !min-h-10 bg-white">Search</button>
      </form>
      <FilterTabs
        base="/admin/users"
        param="role"
        current={role}
        options={[
          ["", "All"],
          ["customer", "Customers"],
          ["admin", "Admins"],
          ["blocked", "Blocked"],
        ]}
      />
      <Panel>
        {users.length === 0 ? (
          <Empty>No accounts found.</Empty>
        ) : (
          <Table head={["Name", "Joined", "Orders", "Spent", "Role", "Access"]}>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-stone-100/50">
                <Td>
                  <span className="block font-medium">{u.full_name ?? "—"}</span>
                  <span className="block text-xs text-stone-400">{u.email}</span>
                </Td>
                <Td className="text-stone-600">{fmtDate(u.created_at)}</Td>
                <Td>{stats.get(u.id)?.count ?? 0}</Td>
                <Td>{inr(stats.get(u.id)?.spent ?? 0)}</Td>
                <UserControls id={u.id} role={u.role} blocked={u.is_blocked} isMe={u.id === me.id} />
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
