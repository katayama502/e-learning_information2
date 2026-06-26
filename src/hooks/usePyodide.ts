'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface RunResult {
  stdout: string;
  stderr: string;
}

export function usePyodide() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, (result: RunResult) => void>>(new Map());
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const createWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const { id, type, stdout, stderr } = e.data;
      if (type === 'ready') {
        setReady(true);
        setLoading(false);
      }
      if (type === 'result') {
        const resolve = pendingRef.current.get(id);
        if (resolve) {
          pendingRef.current.delete(id);
          resolve({ stdout: stdout ?? '', stderr: stderr ?? '' });
        }
      }
    };

    worker.onerror = () => {
      setLoading(false);
    };

    setLoading(true);
    setReady(false);
    const id = crypto.randomUUID();
    worker.postMessage({ id, type: 'ready' });
  }, []);

  useEffect(() => {
    createWorker();
    return () => {
      workerRef.current?.terminate();
    };
  }, [createWorker]);

  const run = useCallback((code: string): Promise<RunResult> => {
    return new Promise((resolve) => {
      const id = crypto.randomUUID();
      pendingRef.current.set(id, resolve);
      workerRef.current?.postMessage({ id, type: 'run', code });
    });
  }, []);

  const reset = useCallback(() => {
    pendingRef.current.clear();
    createWorker();
  }, [createWorker]);

  return { ready, loading, run, reset };
}
