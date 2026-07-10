import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom gives component tests a DOM. Pure-logic tests (utils) run fine in it too.
    environment: 'jsdom',
    globals: true,
    // Reset mock call history before every test so one test's calls can't
    // leak into another's assertions (mock implementations are re-set in
    // each suite's beforeEach).
    clearMocks: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      // Exclude things with no testable logic: type decls, the React entrypoint,
      // test files, and the test helpers themselves.
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/main.tsx',
        'src/types.ts',
        'src/vite-env.d.ts',
        'src/test/**',
      ],
    },
  },
})
