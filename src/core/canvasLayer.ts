import { RenderItem } from "./renderItem";

/**
 * CanvasLayer
 */
export class CanvasLayer {
  private _index: number = 0;

  public constructor(private readonly host: RenderItem) {}

  public get index(): number {
    return this._index;
  }

  public set index(layer: number) {
    const prevLayer = this._index;

    /**
     * 当本节点的layer被变更时，将所有与原layer值相同的子节点做同步变更
     */
    this.host.Traverse((node: RenderItem) => {
      const childLayer = node.layer.index;
      if (childLayer === prevLayer) {
        node.layer.index = layer;
      }
    });
  }

  public InitializeChildLayer(child: RenderItem) {
    const layer = this._index;
    if (layer === 0) {
      return;
    }

    /**
     * 当子节点被加入时，将所有layer为默认值0的子节点全部覆写成本节点的layer值
     */
    child.Traverse((node: RenderItem) => {
      if (node.layer.index !== 0) {
        return true;
      }

      node.layer.index = layer;
    });
  }
}
