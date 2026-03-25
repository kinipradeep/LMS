import Link from 'next/link';

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/courses" className="rounded border bg-white p-4">Manage Courses</Link>
        <Link href="/admin/users" className="rounded border bg-white p-4">Manage Users</Link>
        <Link href="/admin/config" className="rounded border bg-white p-4">Platform Config</Link>
        <Link href="/admin/quizzes" className="rounded border bg-white p-4">AI Quiz Studio</Link>
      </div>
    </section>
  );
}
