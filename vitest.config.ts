import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,ts}'],
    // The suite's shared checks read every built page, and this site has 372 of them: on a
    // busy machine one check can take longer than Vitest's five seconds.
    testTimeout: 30_000,
  },
});
