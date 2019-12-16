import { Engine } from "./core/engine";
import { Input } from "./buildin/media/input";
import { CoolDown } from "./util/cooldown";

const interval = new CoolDown(1000);
interval.Activate();

export const MONITOR_MOUSEPOS = 1 << 0;
export const MONITOR_DETAILS = 1 << 1;

export function Monitor(engine: Engine, flag: number) {
  flag & MONITOR_MOUSEPOS && DrawMouse(engine);
  flag & MONITOR_DETAILS && DrawDetails(engine);
}

function DrawMouse(engine: Engine) {
  const ctx = engine.ctx;
  const { x, y } = Input.GetMousePosition();

  ctx.save();
  ctx.fillStyle = "grey";
  ctx.fillRect(x, y - 16, 1, 32);
  ctx.fillRect(x - 16, y, 32, 1);
  ctx.fillText(`${x},${y}`, x + 5, y - 5);
  ctx.restore();
}

let fps = 0;
let childCount = 0;
function DrawDetails(engine: Engine) {
  const delta = Engine.GetDelta();
  const ctx = engine.ctx;

  interval.Cool(delta);
  if (!interval.isCooling) {
    fps = Math.round(100000 / delta) / 100;

    childCount = 0;
    engine.nodeRoot?.Traverse(_ => (childCount++, void 0));

    interval.Activate();
  }

  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 120, 40);
  ctx.fillStyle = "black";
  ctx.fillText(`FPS: ${fps}`, 8, 16);
  ctx.fillText(`Total Objects: ${childCount}`, 8, 32);
  ctx.restore();
}
