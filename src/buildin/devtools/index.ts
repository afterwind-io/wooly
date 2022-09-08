import { Entity } from "../../core/entity";
import { WidgetRoot } from "../ui/root";
import { DevToolsApp } from "./app";
import { DEVTOOL_ROOT_SCOPE } from "./const";

export class DevTools extends Entity {
  public readonly name: string = "DevTools";

  public constructor(builder: () => Entity) {
    super();

    this.scope = DEVTOOL_ROOT_SCOPE;

    this.AddChild(
      new WidgetRoot({
        child: new DevToolsApp(builder),
      })
    );
  }
}
