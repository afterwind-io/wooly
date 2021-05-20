import { Input } from './buildin/media/input';
import { Engine } from './core/engine';
import { DPR } from './core/globals';
import { CanvasManager } from './core/manager/canvas';

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
  backend: '2d',
  w: number = 640,
  h: number = 480
): Engine {
  const canvas = document.createElement('canvas');
  canvas.width = w * DPR;
  canvas.height = h * DPR;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  container.appendChild(canvas);

  Input.Attach(canvas);
  CanvasManager.SetHost(canvas, backend);

  return Engine;
}
