import { Entity } from "../../core/entity";
import { WidgetRoot } from "../ui/root";
import { DevToolsApp } from "./app";

export class DevTools extends Entity {
  public readonly name: string = "DevTools";

  public constructor(builder: () => Entity) {
    super();

    this.scope = -1;

    this.AddChild(
      new WidgetRoot({
        child: new DevToolsApp(builder),
      })
    );
  }
}
