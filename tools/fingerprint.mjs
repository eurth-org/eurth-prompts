// What a prompt's sharing image was made from, in few enough letters to keep in a file.
// tools/make-images.mjs records it for each picture; tests/site.test.ts compares it with the
// bank, so a prompt can't change and keep its old picture unnoticed.
import { createHash } from 'node:crypto';

/** @param {{ n: number, theme: string, text: string }} prompt */
export const fingerprint = (prompt) => createHash('sha256').update(`${prompt.n}|${prompt.theme}|${prompt.text}`).digest('hex').slice(0, 12);
