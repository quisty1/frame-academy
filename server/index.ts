import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { projectSchema } from '../src/lib/project';
import { renderProject } from './render';
const app = express();
const directory = path.resolve('.renders');
await fs.mkdir(directory, { recursive: true });
app.use(express.json({ limit: '512kb' }));
// Bind only to loopback: this portfolio renderer is intentionally a local desktop service.
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.status(403).json({ error: 'Этот сервер доступен только локальной студии.' });
    return;
  }
  next();
});
app.use(
  '/renders',
  express.static(directory, {
    setHeaders: (res) => res.setHeader('Content-Disposition', 'attachment'),
  }),
);
type Job = {
  id: string;
  status: 'queued' | 'bundling' | 'rendering' | 'done' | 'error';
  progress: number;
  url?: string;
  error?: string;
};
const jobs = new Map<string, Job>();
let active = false;
app.get('/api/health', (_req, res) => res.json({ ok: true, renderer: 'Remotion', version: 1 }));
app.post('/api/renders', (req, res) => {
  const parsed = z
    .object({ project: projectSchema, scale: z.union([z.literal(1), z.literal(2 / 3)]).default(1) })
    .safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: 'Некорректный проект. Проверьте длительность и количество сцен.' });
    return;
  }
  if (active) {
    res.status(429).json({ error: 'Сейчас уже создаётся видео. Дождитесь завершения экспорта.' });
    return;
  }
  active = true;
  const job: Job = { id: randomUUID(), status: 'queued', progress: 0 };
  jobs.set(job.id, job);
  res.status(202).json(job);
  void (async () => {
    try {
      job.status = 'bundling';
      await renderProject(
        parsed.data.project,
        path.join(directory, `${job.id}.mp4`),
        parsed.data.scale,
        (p) => {
          job.status = 'rendering';
          job.progress = p;
        },
      );
      job.status = 'done';
      job.progress = 1;
      job.url = `/renders/${job.id}.mp4`;
    } catch (e) {
      job.status = 'error';
      job.error = 'Не удалось создать видео. Проверьте журнал сервера и наличие свободного места.';
      console.error('Render failed:', e);
    } finally {
      active = false;
      setTimeout(
        () => {
          jobs.delete(job.id);
          void fs.rm(path.join(directory, `${job.id}.mp4`), { force: true });
        },
        24 * 60 * 60 * 1000,
      ).unref();
    }
  })();
});
app.get('/api/renders/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Экспорт не найден. Создайте видео заново.' });
    return;
  }
  res.json(job);
});
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('dist')));
  app.get('/{*path}', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
}
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(400).json({ error: 'Запрос не удалось прочитать. Проверьте файл проекта.' });
  },
);
app.listen(3001, '127.0.0.1', () => console.log('Remotion renderer: http://127.0.0.1:3001'));
