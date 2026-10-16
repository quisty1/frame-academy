import path from 'node:path';
import { defaultProject } from '../src/lib/project';
import { renderProject } from './render';
const output = path.resolve('../frame-academy-demo.mp4');
let last = -1;
await renderProject(defaultProject, output, 1, (p) => {
  const percent = Math.floor((p * 100) / 10) * 10;
  if (percent !== last) {
    last = percent;
    console.log(`Rendering ${percent}%`);
  }
});
console.log(`Video saved: ${output}`);
