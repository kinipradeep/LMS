import Link from 'next/link';
import { api } from '@/lib/api';

type Lesson = { id: string; title: string };
type Module = { id: string; title: string; lessons: Lesson[] };

export default async function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const modules = await api<Module[]>(`/lms/courses/${id}/modules`, { headers: { Authorization: `Bearer demo-token` } });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Course Content</h1>
      {modules.map((module) => (
        <div key={module.id} className="rounded border bg-white p-4">
          <h2 className="font-semibold">{module.title}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {module.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/lesson/${lesson.id}`} className="text-cyan-700">{lesson.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
