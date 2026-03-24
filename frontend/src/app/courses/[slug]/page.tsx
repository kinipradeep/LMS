import { api } from '@/lib/api';

type Lesson = { id: string; title: string };
type Module = { id: string; title: string; lessons: Lesson[] };
type Course = { id: string; title: string; description: string; price: string; modules: Module[] };

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await api<Course>(`/courses/${slug}`);

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="mt-2 text-slate-600">{course.description}</p>
        <p className="mt-3 text-lg font-semibold">₹{course.price}</p>
        <button className="mt-4 rounded bg-cyan-700 px-4 py-2 text-white">Buy Course (Razorpay)</button>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Curriculum</h2>
        {course.modules.map((module) => (
          <div key={module.id} className="rounded border bg-white p-4">
            <h3 className="font-semibold">{module.title}</h3>
            <ul className="ml-5 mt-2 list-disc text-sm text-slate-700">
              {module.lessons.map((lesson) => <li key={lesson.id}>{lesson.title}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
