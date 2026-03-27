import { api } from '@/lib/api';
import { CourseCard } from '@/components/CourseCard';

type Course = { id: string; title: string; slug: string; description: string; price: string };

export default async function HomePage() {
  const courses = await api<Course[]>('/courses');

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Cybersecurity Certifications for Modern Teams</h1>
        <p className="mt-3 text-slate-600">Master CISSP, CISM, CRISC, and Privacy tracks with structured lessons and quizzes.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.slice(0, 4).map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </section>
  );
}
