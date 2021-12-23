import { Viewport } from "../viewport";

export const ViewportManager = new (class ViewportManager {
  /**
   * { [composition: number]: { [layer: number]: Viewport } }
   */
  private registry: Map<number, Map<number, Viewport>> = new Map();

  public Add(composition: number, layer: number): void {
    let l = this.registry.get(composition);
    if (!l) {
      l = new Map();
      this.registry.set(composition, l);
    }

    let viewport = l.get(layer);
    if (!viewport) {
      viewport = new Viewport();
      l.set(layer, viewport);
    } else {
      throw new Error(
        `[wooly] Can not add duplicate viewport: (composition[${composition}],layer[${layer}]).`
      );
    }
  }

  public Get(composition: number, layer: number): Viewport {
    const viewport = this.registry.get(composition)?.get(layer);
    if (!viewport) {
      throw new Error(
        `[wooly] Viewport(composition[${composition}],layer[${layer}]) not exists.`
      );
    }

    return viewport;
  }

  public Remove(composition: number, layer: number): void {
    this.registry.get(composition)?.delete(layer);
  }
})();
