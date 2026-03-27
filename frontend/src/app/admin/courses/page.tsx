import { api } from '@/lib/api';
import { CoursePublisher } from '@/components/admin/CoursePublisher';

type Course = { id: string; title: string; published: boolean; createdAt: string; trainerId?: string | null };

export default async function AdminCoursesPage() {
  const courses = await api<Course[]>('/admin/courses', { headers: { Authorization: 'Bearer demo-admin-token' } });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin/Trainer - Courses</h1>
      <p className="text-sm text-slate-600">Create and publish courses from this studio interface.</p>
      <CoursePublisher />
      <div className="space-y-2">
        {courses.map((course) => (
          <div key={course.id} className="rounded border bg-white p-4">
            <p className="font-medium">{course.title}</p>
            <p className="text-sm text-slate-600">{course.published ? 'Published' : 'Draft'}</p>
            <p className="text-xs text-slate-500">Trainer: {course.trainerId ?? 'Unassigned'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
