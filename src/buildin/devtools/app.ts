import { Edge } from "../ui/common/edge";
import { Container } from "../ui/container";
import { CompositeWidget } from "../ui/foundation/compositeWidget";
import { Reactive } from "../ui/foundation/decorator";
import { Widget } from "../ui/foundation/widget";
import { Modal } from "./common/modal";
import { Tab, Tabs } from "./common/tabs";
import { DevToolsInspector } from "./inspector";

export class DevToolsApp extends CompositeWidget {
  public readonly name: string = "DevToolsApp";

  private _activeTab: string = "Inspector";

  @Reactive
  private OnSwitchTab(label: string): void {
    this._activeTab = label;
  }

  protected _Render(): Widget | null {
    return new Modal({
      width: 700,
      height: 480,
      title: "Wooly DevTools",
      child: new Container({
        padding: new Edge(8, 8, 0, 8),
        child: new Tabs({
          activeTab: this._activeTab,
          children: [
            new Tab({
              label: "Metrics",
              child: null,
            }),
            new Tab({
              label: "Inspector",
              child: new DevToolsInspector({}),
            }),
            new Tab({
              label: "Settings",
              child: null,
            }),
          ],
          onSwitchTab: this.OnSwitchTab,
        }),
      }),
    });
  }
}
