/* eslint-disable @typescript-eslint/no-explicit-any */
declare const self: DedicatedWorkerGlobalScope;

let pyodide: any = null;
let loading = false;

async function loadPyodideInstance() {
  if (pyodide) return pyodide;
  if (loading) {
    // Wait until loaded
    while (loading) await new Promise((r) => setTimeout(r, 100));
    return pyodide;
  }
  loading = true;
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
  pyodide = await (self as any).loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
  });
  loading = false;
  return pyodide;
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type, code } = e.data;

  if (type === 'run') {
    try {
      const py = await loadPyodideInstance();

      let stdout = '';
      let stderr = '';

      py.setStdout({ batched: (s: string) => { stdout += s + '\n'; } });
      py.setStderr({ batched: (s: string) => { stderr += s + '\n'; } });

      await py.runPythonAsync(code);

      self.postMessage({ id, type: 'result', stdout: stdout.trimEnd(), stderr: stderr.trimEnd() });
    } catch (err: any) {
      self.postMessage({ id, type: 'result', stdout: '', stderr: String(err) });
    }
  }

  if (type === 'ready') {
    try {
      await loadPyodideInstance();
      self.postMessage({ id, type: 'ready' });
    } catch (err: any) {
      self.postMessage({ id, type: 'error', message: String(err) });
    }
  }
};
