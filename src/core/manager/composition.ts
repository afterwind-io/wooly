import { DPR } from '../globals';
import { RenderItem } from '../renderItem';

/**
 * A wrapper of HTMLCanvasElement instance to
 * render an isolate portion of content for later composition.
 *
 * @export
 * @class CompositionCanvas
 */
export class CompositionCanvas {
  /**
   * A flag indicates whether the underlying canvas is free to (re)use or not.
   *
   * @type {boolean}
   * @memberof CompositionCanvas
   */
  public idle: boolean;

  private readonly context: CanvasRenderingContext2D;

  public constructor() {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    this.context = canvas.getContext('2d')!;
    this.idle = true;
  }

  public get Canvas(): HTMLCanvasElement {
    return this.context.canvas;
  }

  public get Context(): CanvasRenderingContext2D {
    return this.context;
  }

  public SetCanvasDimension(width: number, height: number) {
    const canvas = this.Canvas;

    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
}

export const CompositionManager = new (class CompositionManager {
  private canvasPool: CompositionCanvas[] = [];
  private registry: Map<number /** Node id */, CompositionCanvas> = new Map();

  public CreateComposition(node: RenderItem) {
    let cc = this.registry.get(node.id);
    if (!cc) {
      cc = this.distributeFreeCanvas();
      this.registry.set(node.id, cc);
    }

    cc.SetCanvasDimension(node.w, node.h);
  }

  public GetComposition(nodeId: number): CompositionCanvas {
    const cc = this.registry.get(nodeId);
    if (!cc) {
      throw new Error('');
    }

    return cc;
  }

  public ReleaseComposition(nodeId: number) {
    const cc = this.registry.get(nodeId);
    if (cc) {
      cc.idle = true;
      this.registry.delete(nodeId);
    }
  }

  private distributeFreeCanvas(): CompositionCanvas {
    if (this.canvasPool.length > 50) {
      throw new Error(
        '[wooly] Potential distribution overflow during composition.'
      );
    }

    let cc = this.canvasPool.find((c) => c.idle);

    if (!cc) {
      cc = new CompositionCanvas();
      this.canvasPool.push(cc);
    }

    cc.idle = false;
    return cc;
  }
})();
