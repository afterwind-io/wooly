import { Engine } from "./core/engine";

/**
 * Initialize a new engine instance.
 *
 * @export
 * @param {HTMLElement} container The host dom element as the parent of the canvas.
 * @param {"2d"} backend Canvas type.
 * @param {number} [w=640] Canvas height.
 * @param {number} [h=480] Canvas width.
 * @returns {Engine} The engine instance.
 */
export function Create(
  container: HTMLElement,
  backend: "2d",
  w: number = 640,
  h: number = 480
): Engine {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  container.appendChild(canvas);

  return Engine.Create(canvas, backend);
}
