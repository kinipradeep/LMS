import { api } from '@/lib/api';

type User = { id: string; name: string; email: string; role: string };

export default async function AdminUsersPage() {
  const users = await api<User[]>('/admin/users', { headers: { Authorization: `Bearer demo-admin-token` } });

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Admin - Users</h1>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="rounded border bg-white p-4">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm">{user.email}</p>
            <p className="text-xs uppercase text-slate-500">{user.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
