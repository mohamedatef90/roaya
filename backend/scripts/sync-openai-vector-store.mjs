import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(backendRoot, '.env') });
const corpusPath = path.resolve(backendRoot, process.env.RAG_CORPUS_PATH ?? '../roaya-website/rag/corpus.json');
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY is required. Keep it in backend/.env and never commit it.');

const request = async (pathname, init = {}) => {
  const response = await fetch(`https://api.openai.com/v1${pathname}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, ...(init.headers ?? {}) },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? `OpenAI request failed (${response.status})`);
  return body;
};

const corpus = JSON.parse(await fs.readFile(corpusPath, 'utf8'));
const documents = new Map();
for (const chunk of corpus.chunks ?? []) {
  const key = `${chunk.language}:${chunk.url}`;
  const current = documents.get(key) ?? { title: chunk.title, url: chunk.url, language: chunk.language, parts: [] };
  current.parts.push(chunk.text);
  documents.set(key, current);
}

const vectorStore = await request('/vector_stores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: `Roaya public website ${new Date().toISOString().slice(0, 10)}` }),
});

let completed = 0;
for (const [key, document] of documents) {
  const form = new FormData();
  const content = `# ${document.title}\n\nSource: ${document.url}\nLanguage: ${document.language}\n\n${document.parts.join('\n\n')}`;
  const filename = `${key.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'roaya'}.md`;
  form.append('purpose', 'assistants');
  form.append('file', new Blob([content], { type: 'text/markdown' }), filename);
  const file = await request('/files', { method: 'POST', body: form });
  await request(`/vector_stores/${vectorStore.id}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_id: file.id,
      attributes: { title: document.title.slice(0, 512), url: document.url, language: document.language },
    }),
  });
  completed += 1;
  console.log(`Queued ${completed}/${documents.size}: ${document.url} (${document.language})`);
}

console.log(`\nOPENAI_VECTOR_STORE_ID=${vectorStore.id}`);
console.log('Wait for indexing to finish, then add this value to backend/.env.');
