import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultProject, projectSchema } from './project';
import type { Project } from './project';
import { refineDemoCopy } from './copy';
const KEY = 'frame-academy:project:v1';
function load() {
  try {
    const result = projectSchema.safeParse(JSON.parse(localStorage.getItem(KEY) || 'null'));
    return result.success ? refineDemoCopy(result.data) : structuredClone(defaultProject);
  } catch {
    return structuredClone(defaultProject);
  }
}
export function useProject() {
  const [project, setProject] = useState<Project>(load);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [history, setHistory] = useState({ past: [] as Project[], future: [] as Project[] });
  const current = useRef(project);
  const historyRef = useRef(history);
  const update = useCallback((action: Project | ((p: Project) => Project)) => {
    const old = current.current;
    const next = typeof action === 'function' ? action(old) : action;
    if (JSON.stringify(old) === JSON.stringify(next)) return;
    historyRef.current = { past: [...historyRef.current.past.slice(-49), old], future: [] };
    setHistory(historyRef.current);
    current.current = next;
    setProject(next);
  }, []);
  const undo = useCallback(() => {
    const h = historyRef.current;
    if (!h.past.length) return;
    const previous = h.past[h.past.length - 1];
    historyRef.current = { past: h.past.slice(0, -1), future: [current.current, ...h.future] };
    current.current = previous;
    setHistory(historyRef.current);
    setProject(previous);
    return previous;
  }, []);
  const redo = useCallback(() => {
    const h = historyRef.current;
    if (!h.future.length) return;
    const next = h.future[0];
    historyRef.current = { past: [...h.past, current.current], future: h.future.slice(1) };
    current.current = next;
    setHistory(historyRef.current);
    setProject(next);
    return next;
  }, []);
  useEffect(() => {
    setSaveState('saving');
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(project));
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 600);
    return () => clearTimeout(t);
  }, [project]);
  return {
    project,
    update,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    saveState,
  };
}
