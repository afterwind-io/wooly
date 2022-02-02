import { CanvasLayer } from "../../core/canvasLayer";
import { Entity } from "../../core/entity";
import { WidgetRoot } from "../ui/root";
import { DevToolsApp } from "./app";

export class DevTools extends Entity {
  public readonly name: string = "DevTools";

  public _Ready() {
    const layer = new CanvasLayer(100000000);
    this.AddChild(layer);

    layer.AddChild(
      new WidgetRoot({
        child: new DevToolsApp({}),
      })
    );
  }
}
