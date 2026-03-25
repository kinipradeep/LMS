import { CourseCard } from '@/components/CourseCard';
import { api } from '@/lib/api';

type Course = { id: string; title: string; slug: string; description: string; price: string };

export default async function CoursesPage() {
  const courses = await api<Course[]>('/courses');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">All Certification Courses</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </div>
  );
}
