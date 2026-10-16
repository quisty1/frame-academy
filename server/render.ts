import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import type { Project } from '../src/lib/project';
let bundled: Promise<string> | null = null;
export async function renderProject(
  project: Project,
  output: string,
  scale = 1,
  onProgress: (p: number) => void = () => {},
) {
  if (!bundled)
    bundled = bundle({ entryPoint: path.resolve('src/remotion/index.ts') }).catch((e) => {
      bundled = null;
      throw e;
    });
  const serveUrl = await bundled;
  const inputProps = { project };
  const composition = await selectComposition({ serveUrl, id: 'AcademyLesson', inputProps });
  await renderMedia({
    serveUrl,
    composition,
    inputProps,
    codec: 'h264',
    outputLocation: output,
    scale,
    crf: 20,
    concurrency: 2,
    onProgress: ({ progress }) => onProgress(progress),
    overwrite: true,
  });
}
