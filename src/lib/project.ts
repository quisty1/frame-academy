import { refineDemoCopy } from './copy';
import { z } from 'zod';
export const FPS = 30;
export const sceneKinds = ['intro', 'concept', 'code', 'steps', 'outro'] as const;
export const sceneSchema = z.object({
  id: z.string().min(1).max(80),
  kind: z.enum(sceneKinds),
  animation: z.enum(['spring', 'fade', 'slide', 'none']).default('spring'),
  points: z
    .array(z.object({ title: z.string().max(80), description: z.string().max(160) }))
    .max(4)
    .default([]),
  title: z.string().min(1).max(180),
  subtitle: z.string().max(500),
  duration: z.number().int().min(2).max(30),
  label: z.string().max(80),
  code: z.string().max(5000),
  notes: z.string().max(10000),
});
export const projectSchema = z
  .object({
    version: z.literal(1),
    name: z.string().min(1).max(120),
    theme: z.enum(['lavender', 'mint', 'peach', 'midnight']),
    format: z.enum(['landscape', 'portrait', 'square']),
    scenes: z.array(sceneSchema).min(1).max(20),
  })
  .refine((p) => new Set(p.scenes.map((s) => s.id)).size === p.scenes.length, {
    message: 'Идентификаторы сцен должны быть уникальными',
  });
export type Scene = z.infer<typeof sceneSchema>;
export type Project = z.infer<typeof projectSchema>;
// Palette IDs remain stable so existing JSON projects stay compatible.
export const themes = {
  lavender: {
    name: 'Светлая',
    paper: '#ffffff',
    ink: '#252525',
    accent: '#737373',
    soft: '#f4f4f2',
  },
  mint: { name: 'Холодная', paper: '#f3f5f5', ink: '#293130', accent: '#67716e', soft: '#e8edeb' },
  peach: { name: 'Тёплая', paper: '#f7f6f2', ink: '#34332f', accent: '#78766c', soft: '#ecebe5' },
  midnight: {
    name: 'Тёмная',
    paper: '#252525',
    ink: '#ededeb',
    accent: '#a3a3a0',
    soft: '#303030',
  },
};
export const dimensions = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};
export const totalFrames = (project: Project) =>
  project.scenes.reduce((n, s) => n + s.duration * FPS, 0);
export const sceneStart = (project: Project, index: number) =>
  project.scenes.slice(0, index).reduce((n, s) => n + s.duration * FPS, 0);
export const sceneAtFrame = (project: Project, frame: number) => {
  let end = 0;
  for (let i = 0; i < project.scenes.length; i++) {
    end += project.scenes[i].duration * FPS;
    if (frame < end) return i;
  }
  return project.scenes.length - 1;
};
export const timecode = (frame: number) =>
  `${String(Math.floor(frame / FPS / 60)).padStart(2, '0')}:${String(Math.floor(frame / FPS) % 60).padStart(2, '0')}`;
export const uid = () => globalThis.crypto.randomUUID();
export const makeScene = (kind: Scene['kind']): Scene => ({
  id: uid(),
  kind,
  animation: 'spring',
  points:
    kind === 'steps'
      ? [
          { title: 'Создайте функцию', description: 'Назовите её с большой буквы' },
          { title: 'Добавьте JSX', description: 'Опишите будущий интерфейс' },
          { title: 'Передайте props', description: 'Настройте компонент данными' },
        ]
      : kind === 'concept'
        ? [
            { title: '<App />', description: 'Приложение' },
            { title: '<Profile />', description: 'Карточка профиля' },
            { title: '<Button />', description: 'Аватар · Имя · Кнопка' },
          ]
        : [],
  title:
    kind === 'code'
      ? 'Ваш первый компонент'
      : kind === 'steps'
        ? 'Порядок действий'
        : kind === 'outro'
          ? 'Самостоятельная работа'
          : kind === 'concept'
            ? 'Структура компонента'
            : 'Первый React-\nкомпонент',
  subtitle: 'Добавьте описание сцены.',
  duration: 6,
  label: 'React · Основы',
  code: 'function Welcome({ name }) {\n  return (\n    <h1>Привет, {name}!</h1>\n  );\n}',
  notes: 'Объясните основную идею своими словами. Покажите пример и предложите ученику повторить.',
});
export const defaultProject: Project = refineDemoCopy({
  version: 1,
  name: 'React. От идеи до компонента',
  theme: 'lavender',
  format: 'landscape',
  scenes: [
    {
      id: 'intro',
      kind: 'intro',
      animation: 'spring',
      points: [],
      title: 'Первый React-\nкомпонент',
      subtitle: 'Создайте свой первый React-компонент.\nОдин шаг — и всё встаёт на свои места.',
      duration: 7,
      label: 'Знакомство с React',
      code: '',
      notes:
        'Начните с вопроса: из чего состоит любой интерфейс? Покажите, что даже сложную страницу можно разложить на маленькие независимые части. В этом уроке мы создадим первую такую часть.',
    },
    {
      id: 'concept',
      kind: 'concept',
      animation: 'spring',
      points: [
        { title: '<App />', description: 'Приложение' },
        { title: '<Profile />', description: 'Карточка профиля' },
        { title: '<Button />', description: 'Аватар · Имя · Кнопка' },
      ],
      title: 'Интерфейс —\nэто конструктор.',
      subtitle: 'Компонент — независимая часть интерфейса.\nУ каждой детали своя задача.',
      duration: 7,
      label: '01 / Мышление компонентами',
      code: '',
      notes:
        'Разберите карточку профиля: аватар, имя, кнопка. Каждый блок можно использовать повторно. Это основа компонентного подхода.',
    },
    {
      id: 'code',
      kind: 'code',
      animation: 'spring',
      points: [],
      title: 'Немного кода.\nМного возможностей.',
      subtitle: 'Функция возвращает разметку.\nReact превращает её в интерфейс.',
      duration: 9,
      label: '02 / Первый компонент',
      code: 'function Welcome({ name }) {\n  return (\n    <div className="card">\n      <h1>Привет, {name}!</h1>\n      <p>Рад тебя видеть.</p>\n    </div>\n  );\n}',
      notes:
        'Это обычная JavaScript-функция. Название начинается с большой буквы. Синтаксис внутри return называется JSX. Обратите внимание на фигурные скобки: так мы вставляем значение переменной.',
    },
    {
      id: 'steps',
      kind: 'steps',
      animation: 'spring',
      points: [
        { title: 'Создайте функцию', description: 'Назовите её с большой буквы' },
        { title: 'Добавьте JSX', description: 'Опишите будущий интерфейс' },
        { title: 'Передайте props', description: 'Настройте компонент данными' },
      ],
      title: 'Три шага —\nи компонент готов.',
      subtitle: 'Придумайте. Напишите. Используйте.',
      duration: 7,
      label: '03 / Закрепляем на практике',
      code: '',
      notes:
        'Предложите создать компонент ProfileCard с параметрами name и role. Затем отобразить две карточки с разными данными. Поставьте видео на паузу для практики.',
    },
    {
      id: 'outro',
      kind: 'outro',
      animation: 'spring',
      points: [],
      title: 'Вы уже умеете\nбольше, чем вчера.',
      subtitle: 'Следующий шаг — состояние и события.\nПродолжайте создавать.',
      duration: 6,
      label: 'Ваша очередь создавать',
      code: '',
      notes:
        'Повторите главное: компонент — функция, props — входные данные, JSX — описание интерфейса. Попросите ученика объяснить это своими словами.',
    },
  ],
});
export const downloadJson = (project: Project) => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'frame-project.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
