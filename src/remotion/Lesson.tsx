import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { CSSProperties } from 'react';
import { FPS, sceneStart, themes, totalFrames } from '../lib/project';
import type { Project, Scene } from '../lib/project';
import '@fontsource-variable/manrope';
const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
function CodeBlock({
  code,
  ink,
  soft,
  frame = 100,
  animated = false,
}: {
  code: string;
  ink: string;
  soft: string;
  frame?: number;
  animated?: boolean;
}) {
  const lines = code.split('\n');
  const name = /function\s+(\w+)/.exec(code)?.[1] ?? 'Example';
  return (
    <div
      style={{
        border: `1.5px solid ${ink}30`,
        background: soft,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          padding: '22px 28px',
          borderBottom: `1px solid ${ink}24`,
          fontSize: 18,
          fontFamily: mono,
          color: ink,
          opacity: 0.7,
        }}
      >
        {name}.tsx
      </div>
      <pre
        style={{
          fontFamily: mono,
          fontSize: lines.length > 10 ? 19 : 24,
          lineHeight: 1.8,
          margin: 0,
          padding: '30px 24px',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          color: ink,
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', opacity: animated && frame < i * 4 ? 0.25 : 1 }}>
            <span
              style={{
                width: 40,
                flexShrink: 0,
                opacity: 0.35,
                fontSize: 17,
                paddingTop: 5,
                textAlign: 'right',
                marginRight: 23,
                userSelect: 'none',
              }}
            >
              {i + 1}
            </span>
            <span>{line || ' '}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
export function SceneArt({
  scene,
  theme = 'lavender',
  progress = 1,
  frame = 60,
  portrait = false,
  square = false,
}: {
  scene: Scene;
  theme?: Project['theme'];
  progress?: number;
  frame?: number;
  portrait?: boolean;
  square?: boolean;
}) {
  const c = themes[theme];
  const compact = portrait || square;
  const fontSize = square ? 58 : compact ? 76 : 76;
  const titleSize = Math.max(42, fontSize - Math.max(0, scene.title.length - 45) * 0.32);
  const visualStyle: CSSProperties = {
    opacity: progress,
    transform: `translateY(${(1 - progress) * 18}px)`,
  };
  const introCode = 'function Welcome({ name }) {\n  return <h1>Привет, {name}!</h1>;\n}';
  return (
    <div
      className={`video-scene scene-${scene.kind}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: c.paper,
        color: c.ink,
        fontFamily: 'Manrope Variable, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: compact ? '5.5% 7%' : '7.5% 6.5%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 24,
            borderBottom: `1px solid ${c.ink}28`,
            fontSize: 21,
          }}
        >
          <span style={{ fontWeight: 650, letterSpacing: -0.6 }}>Frame</span>
          <span style={{ opacity: 0.6, fontSize: 19 }}>Видеоурок</span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : '1fr 1.05fr',
            alignContent: 'center',
            alignItems: 'center',
            gap: compact ? 40 : 95,
            paddingBlock: compact ? 35 : 50,
            ...visualStyle,
          }}
        >
          <div>
            <div
              style={{
                fontSize: square ? 18 : 21,
                color: c.accent,
                marginBottom: compact ? 22 : 35,
              }}
            >
              {scene.label}
            </div>
            <h1
              style={{
                fontSize: titleSize,
                fontWeight: 500,
                letterSpacing: -2.7,
                lineHeight: 1.15,
                whiteSpace: 'pre-line',
                margin: 0,
              }}
            >
              {scene.title}
            </h1>
            <p
              style={{
                fontSize: square ? 21 : 25,
                lineHeight: 1.7,
                color: c.accent,
                whiteSpace: 'pre-line',
                maxWidth: 720,
                margin: '30px 0 0',
              }}
            >
              {scene.subtitle}
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: compact ? undefined : 820 }}>
            {scene.kind === 'intro' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <CodeBlock code={introCode} ink={c.ink} soft={c.soft} />
                <div style={{ padding: '0 3px', fontSize: 18, color: c.accent }}>
                  Результат в браузере
                </div>
                <div
                  style={{
                    border: `1.5px solid ${c.ink}30`,
                    padding: square ? 30 : 45,
                    background: c.soft,
                  }}
                >
                  <div
                    style={{
                      fontSize: compact ? 35 : 39,
                      fontWeight: 500,
                      letterSpacing: -1,
                      marginBottom: 12,
                    }}
                  >
                    Привет, Алексей!
                  </div>
                  <div style={{ fontSize: 22, color: c.accent }}>name = «Алексей»</div>
                </div>
              </div>
            ) : null}
            {scene.kind === 'concept' ? (
              <div>
                {scene.points.map((point, i) => (
                  <div
                    key={i}
                    style={{
                      marginLeft: i * 30,
                      border: `1.5px solid ${c.ink}35`,
                      background: i === 1 ? c.soft : c.paper,
                      padding: compact ? 26 : 34,
                      marginBottom: i === scene.points.length - 1 ? 0 : 22,
                      opacity: interpolate(frame, [i * 10, i * 10 + 15], [0.25, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }),
                    }}
                  >
                    <div
                      style={{
                        fontFamily: point.title.includes('<') ? mono : undefined,
                        fontSize: 32,
                        fontWeight: 500,
                        letterSpacing: -0.5,
                      }}
                    >
                      {point.title}
                    </div>
                    <div style={{ fontSize: 21, color: c.accent, marginTop: 13 }}>
                      {point.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {scene.kind === 'code' ? (
              <CodeBlock
                code={scene.code}
                ink={c.ink}
                soft={c.soft}
                frame={frame}
                animated={scene.animation !== 'none'}
              />
            ) : null}
            {scene.kind === 'steps' ? (
              <div>
                {scene.points.map((point, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 28,
                      padding: '30px 0',
                      borderTop: `1px solid ${c.ink}30`,
                      opacity: interpolate(frame, [i * 15, i * 15 + 16], [0.3, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }),
                    }}
                  >
                    <span
                      style={{ fontFamily: mono, fontSize: 22, color: c.accent, paddingTop: 6 }}
                    >
                      {i + 1}.
                    </span>
                    <div>
                      <h2
                        style={{
                          fontSize: 30,
                          fontWeight: 500,
                          letterSpacing: -0.6,
                          margin: '0 0 12px',
                        }}
                      >
                        {point.title}
                      </h2>
                      <p style={{ fontSize: 21, lineHeight: 1.6, color: c.accent, margin: 0 }}>
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {scene.kind === 'outro' ? (
              <div style={{ borderTop: `1px solid ${c.ink}35`, paddingTop: 30 }}>
                <div style={{ fontSize: 20, color: c.accent, marginBottom: 20 }}>
                  Самостоятельная работа
                </div>
                {['Воспроизведите пример', 'Измените входные данные', 'Объясните результат'].map(
                  (v, i) => (
                    <div
                      key={v}
                      style={{
                        display: 'flex',
                        gap: 22,
                        padding: '23px 0',
                        fontSize: 28,
                        borderBottom: `1px solid ${c.ink}20`,
                      }}
                    >
                      <span
                        style={{ fontFamily: mono, opacity: 0.45, fontSize: 22, paddingTop: 4 }}
                      >
                        {i + 1}.
                      </span>
                      {v}
                    </div>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div
          style={{
            borderTop: `1px solid ${c.ink}28`,
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 18,
            color: c.accent,
          }}
        >
          <span>
            {scene.kind === 'code'
              ? 'Пример кода'
              : scene.kind === 'steps'
                ? 'Практика'
                : scene.kind === 'outro'
                  ? 'Задание'
                  : 'Основы'}
          </span>
          <span>Frame</span>
        </div>
      </div>
    </div>
  );
}
function AnimatedScene({ scene, theme }: { scene: Scene; theme: Project['theme'] }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const animated = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });
  const linear = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const enter =
    scene.animation === 'none' || scene.animation === 'fade'
      ? 1
      : scene.animation === 'slide'
        ? linear
        : animated;
  const end = interpolate(frame, [scene.duration * fps - 7, scene.duration * fps], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const square = height === width;
  const portrait = height >= width;
  const baseW = portrait ? 1080 : 1920;
  const baseH = square ? 1080 : portrait ? 1920 : 1080;
  const scale = Math.min(width / baseW, height / baseH);
  return (
    <AbsoluteFill
      style={{ background: themes[theme].paper, alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        style={{
          width: baseW,
          height: baseH,
          position: 'absolute',
          transform: `scale(${scale})`,
          opacity: end * (scene.animation === 'fade' ? linear : 1),
        }}
      >
        <SceneArt
          scene={scene}
          theme={theme}
          progress={enter}
          frame={frame}
          portrait={portrait}
          square={square}
        />
      </div>
    </AbsoluteFill>
  );
}
export function Lesson({ project }: { project: Project }) {
  return (
    <AbsoluteFill style={{ background: themes[project.theme].paper }}>
      {project.scenes.map((scene, i) => (
        <Sequence
          key={scene.id}
          from={sceneStart(project, i)}
          durationInFrames={scene.duration * FPS}
          premountFor={15}
        >
          <AnimatedScene scene={scene} theme={project.theme} />
        </Sequence>
      ))}
      <VideoProgress project={project} />
    </AbsoluteFill>
  );
}
function VideoProgress({ project }: { project: Project }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 3,
        width: `${(frame / (totalFrames(project) - 1)) * 100}%`,
        background: themes[project.theme].ink,
        opacity: 0.5,
      }}
    />
  );
}
