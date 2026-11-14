/**
 * The card's colours and the yurt beside the site's name, for the pictures the site makes.
 * A picture can't use custom properties, so the colours are read from @eurth/style's tokens as
 * plain values (HANDBOOK.md, Look). Build time only: pages hand the result to the tool as props.
 */
import { resolveColors } from '@eurth/style';
import yurt from '@eurth/style/assets/eurth-yurt-circle.svg?raw';
import tokens from '@eurth/style/tokens.json';
import type { CardLook, CardMark } from '../prompts/card';

/** Pictures are always Night, like the suite's sharing images. */
export function cardLook(): CardLook {
  const night = resolveColors(tokens, 'dark');
  return {
    ground: night.surface!,
    card: night['surface-raised']!,
    ink: night.ink!,
    muted: night['ink-muted']!,
    fontFamily: tokens.type.families.sans,
  };
}

/** The Eurth yurt, exactly as the package draws it, in the shape the card takes it. */
export function cardMark(): CardMark {
  const viewBox = /viewBox="([^"]+)"/.exec(yurt)?.[1];
  const body = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(yurt)?.[1];
  if (!viewBox || !body) throw new Error("The yurt from @eurth/style isn't the SVG this expects.");
  return { viewBox, body: body.trim() };
}
