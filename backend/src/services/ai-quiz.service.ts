import { env } from '../config/env.js';

type AIProvider = 'openai' | 'gemini' | 'claude';

type GeneratedQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  domain: string;
};

const buildPrompt = (input: {
  title: string;
  domain: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}) => `Generate ${input.questionCount} ${input.difficulty} multiple-choice cybersecurity questions for "${input.title}" in the domain "${input.domain}".
Return strict JSON array where each item has: question (string), options (string[4]), correctAnswer (exact option text), explanation (string), domain (string).`;

const parseJsonArray = (text: string): GeneratedQuestion[] => {
  const cleaned = text.trim().replace(/^```json/, '').replace(/```$/, '');
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('AI response is not an array');
  return parsed as GeneratedQuestion[];
};

async function callOpenAI(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`
    },
    body: JSON.stringify({
      model: env.openaiModel,
      input: prompt
    })
  });
  const body = await response.json();
  const outputText = body.output?.[0]?.content?.[0]?.text;
  if (!outputText) throw new Error('OpenAI did not return text output');
  return parseJsonArray(outputText);
}

async function callGemini(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.geminiApiKey  // Key in header, not URL query string
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );

  const body = await response.json();
  const outputText = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!outputText) throw new Error('Gemini did not return text output');
  return parseJsonArray(outputText);
}

async function callClaude(prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.anthropicApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: env.claudeModel,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const body = await response.json();
  const outputText = body.content?.[0]?.text;
  if (!outputText) throw new Error('Claude did not return text output');
  return parseJsonArray(outputText);
}

export async function generateQuizQuestions(provider: AIProvider, payload: Parameters<typeof buildPrompt>[0]) {
  const prompt = buildPrompt(payload);

  if (provider === 'openai') return callOpenAI(prompt);
  if (provider === 'gemini') return callGemini(prompt);
  return callClaude(prompt);
}
