import { refineDemoCopy } from './copy';
import { defaultProject } from './project';
import type { Project } from './project';
const states: Project = structuredClone(defaultProject);
states.theme = 'mint';
states.name = 'React. Состояние и события';
Object.assign(states.scenes[0], {
  title: 'Интерфейс,\nкоторый отвечает.',
  subtitle: 'Научите компонент запоминать изменения.\nЗнакомимся с useState.',
  label: 'React / Состояние',
  notes:
    'Нажатие кнопки меняет число. Откуда React знает, что интерфейс нужно обновить? В этом уроке знакомимся с состоянием.',
});
Object.assign(states.scenes[1], {
  title: 'Изменение —\nэто цикл.',
  subtitle: 'Событие обновляет состояние.\nReact заново рисует интерфейс.',
  points: [
    { title: 'Событие', description: 'Пользователь нажимает кнопку' },
    { title: 'Состояние', description: 'setCount передаёт новое значение' },
    { title: 'Рендер', description: 'React обновляет отображение' },
  ],
  label: '01 / Как работает состояние',
});
Object.assign(states.scenes[2], {
  title: 'Одна кнопка.\nЖивой интерфейс.',
  subtitle: 'useState хранит значение между рендерами.\nФункция обновления запускает новый рендер.',
  code: 'function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <button onClick={() =>\n      setCount(c => c + 1)}>\n      Нажали {count} раз\n    </button>\n  );\n}',
  label: '02 / Счётчик на useState',
  notes:
    'Хук возвращает пару: текущее значение и функцию обновления. Функциональная форма c => c + 1 получает последнее состояние и помогает избежать устаревшего значения.',
});
Object.assign(states.scenes[3], {
  title: 'Добавим\nнемного жизни.',
  subtitle: 'Создайте счётчик самостоятельно.',
  points: [
    { title: 'Объявите состояние', description: 'const [count, setCount] = useState(0)' },
    { title: 'Обработайте клик', description: 'Вызовите setCount(c => c + 1)' },
    { title: 'Покажите результат', description: 'Добавьте {count} в JSX' },
  ],
  label: '03 / Ваша практика',
});
Object.assign(states.scenes[4], {
  title: 'Каждое действие\nимеет значение.',
  subtitle: 'Вы умеете работать с состоянием.\nСледующая тема — эффекты.',
  notes:
    'Попросите добавить кнопку сброса и ограничить счётчик значением десять. Это проверит понимание состояния и условий.',
});
const remotion: Project = structuredClone(defaultProject);
remotion.theme = 'peach';
remotion.name = 'Remotion. Видео как React-компонент';
Object.assign(remotion.scenes[0], {
  title: 'Ваш код.\nВаше кино.',
  subtitle: 'Создавайте видео так же, как интерфейсы.\nЗнакомство с Remotion.',
  label: 'Первый кадр в Remotion',
  notes:
    'Remotion позволяет описывать видео с помощью React. Каждый кадр — результат выполнения компонента с определённым номером кадра.',
});
Object.assign(remotion.scenes[1], {
  title: 'Время —\nэто просто число.',
  subtitle: 'У каждого кадра есть номер.\nДвижение — функция от времени.',
  points: [
    { title: 'Кадр', description: 'useCurrentFrame() возвращает номер кадра' },
    { title: 'Значение', description: 'interpolate() превращает время в число' },
    { title: 'Изображение', description: 'React рисует кадр с этим значением' },
  ],
  label: '01 / Детерминированная анимация',
});
Object.assign(remotion.scenes[2], {
  title: 'От нуля\nдо движения.',
  subtitle: 'Меняем прозрачность за 30 кадров.\nПри 30 fps это ровно одна секунда.',
  code: "function FadeIn() {\n  const frame = useCurrentFrame();\n  const opacity = interpolate(\n    frame, [0, 30], [0, 1],\n    { extrapolateRight: 'clamp' }\n  );\n\n  return <div style={{ opacity }}>\n    Привет, Remotion!\n  </div>;\n}",
  label: '02 / Первое появление',
  notes:
    'Покажите значение на кадрах 0, 15 и 30: 0, 0.5 и 1. Важно ограничить результат через clamp, иначе значение продолжит расти.',
});
Object.assign(remotion.scenes[3], {
  title: 'Соберите\nсвою историю.',
  subtitle: 'Три шага до первого видео.',
  points: [
    { title: 'Создайте композицию', description: 'Задайте размер, fps и длительность' },
    { title: 'Опишите движение', description: 'Используйте номер текущего кадра' },
    { title: 'Экспортируйте MP4', description: 'Рендер повторит предпросмотр' },
  ],
  label: '03 / Первый рендер',
});
Object.assign(remotion.scenes[4], {
  title: 'Истории,\nсозданные кодом.',
  subtitle: 'Теперь попробуйте spring() и Sequence.\nУ вашей идеи появился таймлайн.',
});
const motion: Project = structuredClone(remotion);
motion.theme = 'midnight';
motion.name = 'Remotion. Анимация со смыслом';
Object.assign(motion.scenes[0], {
  title: 'Движение,\nкоторое объясняет.',
  subtitle: 'Анимация помогает увидеть связь.\nСоздавайте уроки, которые запоминаются.',
  label: 'Дизайн образовательного видео',
});
Object.assign(motion.scenes[1], {
  title: 'Сначала смысл.\nПотом движение.',
  points: [
    { title: 'Внимание', description: 'Покажите, на что смотреть сейчас' },
    { title: 'Связь', description: 'Объясните, как связаны элементы' },
    { title: 'Результат', description: 'Подтвердите изменение состояния' },
  ],
});
Object.assign(motion.scenes[2], {
  title: 'Пружина\nвместо таймера.',
  code: 'function Title() {\n  const frame = useCurrentFrame();\n  const { fps } = useVideoConfig();\n  const p = spring({\n    frame, fps,\n    config: { damping: 200 }\n  });\n  return <h1 style={{\n    opacity: p,\n    transform: `translateY(${(1-p)*30}px)`\n  }}>Понятная идея</h1>;\n}',
  subtitle: 'Движение вычисляется для каждого кадра.\nБез случайности и скрытых таймеров.',
});
Object.assign(motion.scenes[3], {
  points: [
    { title: 'Определите задачу', description: 'Что зритель должен понять?' },
    { title: 'Уберите лишнее', description: 'Оставьте одно важное движение' },
    { title: 'Проверьте ритм', description: 'Дайте зрителю время прочитать' },
  ],
});
// Notes belong to the topic as well as the visuals; every template is a complete teaching brief.
Object.assign(states.scenes[1], {
  notes:
    'Спросите, что должно произойти после клика. Проведите ученика по циклу: событие, обновление состояния, новый рендер. Объясните, почему обычная локальная переменная не сохраняется между вызовами компонента.',
});
Object.assign(states.scenes[3], {
  notes:
    'Попросите создать счётчик с кнопкой увеличения. Затем предложите кнопку сброса. Пусть ученик объяснит, какое состояние хранится и что именно запускает обновление интерфейса.',
});
Object.assign(remotion.scenes[1], {
  notes:
    'Покажите один и тот же компонент на кадрах 0, 15 и 30. Результат должен повторяться при каждом переходе к тому же кадру. Именно поэтому в композиции не нужны setTimeout и случайные значения.',
});
Object.assign(remotion.scenes[3], {
  notes:
    'Предложите создать Composition с fps=30 и durationInFrames=90. Затем добавить FadeIn и экспортировать трёхсекундное видео. Перед началом импортируйте useCurrentFrame и interpolate из remotion.',
});
Object.assign(remotion.scenes[4], {
  notes:
    'Повторите связь: номер кадра задаёт значение, значение задаёт стиль, React рисует изображение. Следующее упражнение — заменить interpolate на spring и сравнить ощущение движения.',
});
Object.assign(motion.scenes[0], {
  notes:
    'Начните с одного и того же объяснения с анимацией и без неё. Спросите, помогло ли движение понять связь. Если нет — декоративное движение можно убрать.',
});
Object.assign(motion.scenes[1], {
  notes:
    'Разберите три полезные задачи анимации: направить внимание, показать связь и подтвердить результат. Попросите выбрать одну задачу перед тем, как писать код.',
});
Object.assign(motion.scenes[2], {
  notes:
    'Импортируйте spring, useCurrentFrame и useVideoConfig из remotion. Объясните, что spring возвращает прогресс движения на конкретном кадре. damping=200 даёт спокойное появление без выраженного отскока.',
});
Object.assign(motion.scenes[3], {
  notes:
    'Предложите анимировать один заголовок. Затем попросите объяснить, какую задачу решает движение. Проверьте начало, середину и конец покадрово, затем посмотрите сцену целиком.',
});
Object.assign(motion.scenes[4], {
  notes:
    'Завершите принципом: хорошая образовательная анимация помогает понять материал. Предложите убрать одно лишнее движение из проекта и сравнить читаемость.',
});
export const lessonTemplates = {
  lavender: { name: 'Первый компонент', description: 'Основы React', project: defaultProject },
  mint: {
    name: 'Живой интерфейс',
    description: 'Состояние и события',
    project: refineDemoCopy(states),
  },
  peach: {
    name: 'Видео из кода',
    description: 'Знакомство с Remotion',
    project: refineDemoCopy(remotion),
  },
  midnight: {
    name: 'Движение со смыслом',
    description: 'Анимация в Remotion',
    project: refineDemoCopy(motion),
  },
};
