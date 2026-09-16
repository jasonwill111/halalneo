import { describe, it, expect } from 'vitest';
 import { motion, spring, tweened } from 'motion';
 
 describe('Motion library', () => {
   it('loads motions', () => {
     expect(motion).toBeDefined();
   });
 
   it('can create springs', () => {
     const s = spring(0);
     expect(s.value).toBe(0);
   });
 
   it('can create tweened values', () => {
     const t = tweened(0);
     expect(t.value).toBe(0);
   });
 });
