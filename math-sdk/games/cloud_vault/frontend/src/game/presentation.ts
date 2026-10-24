/** Presentation timing only: book values and symbol reconstruction remain authoritative. */
export const CLOUD = { peak: 200, finish: 640, stagger: 14, maxStagger: 112, collapseAfterPeak: 48 } as const;
export const cloudDelay = (index: number) => Math.min(Math.max(0, index) * CLOUD.stagger, CLOUD.maxStagger);
export const cloudCollapseAt = (count: number, speed: number) => (CLOUD.peak + cloudDelay(count - 1) + CLOUD.collapseAfterPeak) * speed;
export const groupTiming = (speed: number) => ({ lead: 80 * speed, gap: 140 * speed, count: 540 * speed, hold: 700 * speed });
export const tumbleDuration = (rows: number, speed: number) => Math.min(430, 200 + Math.sqrt(rows) * 100) * speed;
export const tumbleDelay = (reel: number, row: number, speed: number) => (reel * 20 + row * 12) * speed;
