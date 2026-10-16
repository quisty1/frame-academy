import { Composition } from 'remotion';
import { Lesson } from './Lesson';
import { defaultProject, dimensions, FPS, totalFrames } from '../lib/project';
export function Root() {
  return (
    <Composition
      id="AcademyLesson"
      component={Lesson}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={totalFrames(defaultProject)}
      defaultProps={{ project: defaultProject }}
      calculateMetadata={({ props }) => ({
        ...dimensions[props.project.format],
        durationInFrames: totalFrames(props.project),
      })}
    />
  );
}
