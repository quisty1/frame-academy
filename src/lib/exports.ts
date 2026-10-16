import { FPS, sceneStart } from './project';
import type { Project } from './project';
export function srtTime(seconds: number) {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
}
export function subtitles(project: Project) {
  return project.scenes
    .map(
      (s, i) =>
        `${i + 1}\n${srtTime(sceneStart(project, i) / FPS)} --> ${srtTime(sceneStart(project, i) / FPS + s.duration)}\n${s.subtitle || s.title}\n`,
    )
    .join('\n');
}
export function teachingScript(project: Project) {
  return `# ${project.name}\n\nСценарий видеоурока · Frame Academy\n\n${project.scenes.map((s, i) => `## ${i + 1}. ${s.title.replace(/\n/g, ' ')}\n\n**Тайминг:** ${srtTime(sceneStart(project, i) / FPS).slice(0, 8)} · ${s.duration} сек\n\n**В кадре:** ${s.subtitle.replace(/\n/g, ' ')}\n\n### Слова преподавателя\n\n${s.notes}\n${s.code ? '\n### Пример кода\n\n```jsx\n' + s.code + '\n```\n' : ''}`).join('\n')}`;
}
export function downloadText(text: string, name: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
