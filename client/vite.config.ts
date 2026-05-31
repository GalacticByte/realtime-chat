import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  css: {
    devSourcemap: true,
  },
  build: {
    outDir: path.resolve(__dirname, '../server/dist/public'),
    emptyOutDir: true,
  },
})
