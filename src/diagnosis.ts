import { Engine } from "./core/engine";
import { Input } from "./buildin/media/input";
import { Entity } from "./core/entity";

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

function DrawDetails(engine: Engine) {
  function getChildCount(entity: Entity): number {
    return (
      entity.children.length +
      entity.children.reduce((s, c) => s + getChildCount(c), 0)
    );
  }

  const delta = Engine.GetDelta();
  const ctx = engine.ctx;
  const childCount = getChildCount(engine.rootNode!);

  ctx.save();
  ctx.fillStyle = "grey";
  ctx.fillText(`FPS: ${Math.round(100000 / delta) / 100}`, 8, 16);
  ctx.fillText(`Total Objects: ${childCount}`, 8, 32);
  ctx.restore();
}
