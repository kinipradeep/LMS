import { api } from '@/lib/api';

type Question = { id: string; question: string; options: string[]; domain: string };
type Quiz = { id: string; title: string; duration: number; questions: Question[] };

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await api<Quiz>(`/quizzes/${id}`, { headers: { Authorization: `Bearer demo-token` } });

  return (
    <section>
      <h1 className="text-2xl font-bold">{quiz.title}</h1>
      <p className="text-sm text-slate-600">Duration: {quiz.duration} minutes</p>
      <div className="mt-4 space-y-4">
        {quiz.questions.map((question, idx) => (
          <div key={question.id} className="rounded border bg-white p-4">
            <h2 className="font-medium">{idx + 1}. {question.question}</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {question.options.map((option) => <li key={option}>{option}</li>)}
            </ul>
            <p className="mt-2 text-xs uppercase tracking-wide text-cyan-700">{question.domain}</p>
          </div>
        ))}
      </div>
      <button className="mt-5 rounded bg-slate-900 px-4 py-2 text-white">Submit Quiz</button>
    </section>
  );
}
