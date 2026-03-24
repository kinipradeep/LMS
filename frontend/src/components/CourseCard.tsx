import Link from 'next/link';

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">{course.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{course.description}</p>
      <p className="mt-3 font-medium text-cyan-700">₹{course.price}</p>
      <Link href={`/courses/${course.slug}`} className="mt-4 inline-block rounded bg-slate-900 px-4 py-2 text-sm text-white">
        View Course
      </Link>
    </div>
  );
}
