/// <reference types="vite/client" />

interface Window {
  plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
}
