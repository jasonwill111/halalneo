import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import * as motion from 'motion';
import { spring, tweened } from 'svelte/motion';

describe('Motion library', () => {
   it('loads motions', () => {
     expect(motion).toBeDefined();
   });
 
   it('can create springs', () => {
     const s = spring(0);
      expect(get(s)).toBe(0);
   });
 
   it('can create tweened values', () => {
     const t = tweened(0);
      expect(get(t)).toBe(0);
   });
 });
