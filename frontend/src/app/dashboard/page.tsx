import Link from 'next/link';
import { api } from '@/lib/api';

type Course = { id: string; title: string };

export default async function DashboardPage() {
  const courses = await api<Course[]>('/my-courses', { headers: { Authorization: `Bearer demo-token` } });

  return (
    <section>
      <h1 className="mb-5 text-2xl font-bold">My Courses</h1>
      <div className="space-y-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/course/${course.id}`} className="block rounded border bg-white p-4 hover:shadow-sm">
            {course.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
