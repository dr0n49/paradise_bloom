import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeApp } from "./runtime";

const fake = vi.hoisted(() => ({ apps: [] as any[], observers: [] as any[] }));
vi.mock("@esotericsoftware/spine-pixi-v8", () => ({ Spine: {} }));
vi.mock("pixi.js", () => ({
  Assets: {},
  UPDATE_PRIORITY: { HIGH: 25 },
  Application: class {
    canvas = { style: {} as Record<string, string> };
    screen = { width: 0, height: 0 };
    callbacks: { fn: () => void; priority: number }[] = [];
    onDestroy = () => {};
    stage = { once: (_event: string, fn: () => void) => { this.onDestroy = fn; } };
    ticker = { add: (fn: () => void, _context?: unknown, priority = 0) => { this.callbacks.push({ fn, priority }); } };
    renderer = { resize: vi.fn((w: number, h: number) => {
      this.screen.width = w;
      this.screen.height = h;
      // Pixi autoDensity writes fixed CSS sizes on every renderer resize.
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
    }) };
    constructor() { fake.apps.push(this); }
    async init(options: any) {
      this.renderer.resize(options.width ?? options.resizeTo?.clientWidth ?? 800, options.height ?? options.resizeTo?.clientHeight ?? 600);
    }
    update() { [...this.callbacks].sort((a, b) => b.priority - a.priority).forEach(({ fn }) => fn()); }
    destroy() { this.callbacks = []; this.onDestroy(); }
  },
}));

beforeEach(() => {
  fake.apps.length = 0;
  fake.observers.length = 0;
  vi.stubGlobal("window", { devicePixelRatio: 2 });
  vi.stubGlobal("ResizeObserver", class {
    disconnected = false;
    constructor(public callback: () => void) { fake.observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
    notify() { if (!this.disconnected) this.callback(); }
  });
});
afterEach(() => vi.unstubAllGlobals());

const makeHost = () => ({ clientWidth: 640, clientHeight: 360, appendChild: vi.fn() });
const notifySize = () => fake.observers.forEach(observer => observer.notify());

describe("Spine canvas follows its host", () => {
  it("keeps frame and DOM aligned when only the host changes, before scene layout", async () => {
    const host = makeHost();
    await makeApp(host as unknown as HTMLElement);
    const app = fake.apps[0];
    app.ticker.add(() => {
      expect(app.screen).toEqual({ width: 572, height: 507 });
      expect(app.canvas.style).toMatchObject({ width: "100%", height: "100%" });
    });
    host.clientWidth = 572;
    host.clientHeight = 507;
    notifySize(); // No window resize event: e.g. entering the bonus layout.
    app.update();
    const calls = app.renderer.resize.mock.calls.length;
    app.update();
    expect(app.renderer.resize).toHaveBeenCalledTimes(calls);
  });

  it("waits for a hidden host to regain a usable size", async () => {
    const host = makeHost();
    await makeApp(host as unknown as HTMLElement);
    const app = fake.apps[0];
    host.clientWidth = host.clientHeight = 0;
    notifySize();
    app.update();
    expect(app.screen).toEqual({ width: 640, height: 360 });
    host.clientWidth = 375;
    host.clientHeight = 410;
    notifySize();
    app.update();
    expect(app.screen).toEqual({ width: 375, height: 410 });
    expect(app.canvas.style.width).toBe("100%");
  });

  it("disconnects the host observer when the app is destroyed", async () => {
    await makeApp(makeHost() as unknown as HTMLElement);
    expect(fake.observers).toHaveLength(1);
    fake.apps[0].destroy();
    expect(fake.observers[0].disconnected).toBe(true);
  });
});
