import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { CreateWidgetRef } from "../../ui/foundation/ref";
import { Widget } from "../../ui/foundation/widget";
import { MouseSensor } from "../../ui/mouseSensor";
import { DevToolsContext } from "../context";

interface MouseCaptureOptions {
  onPlayerMouseMove(): void;
  onPlayerMouseClick(): void;
}

export class MouseCapture extends CompositeWidget<MouseCaptureOptions> {
  public readonly name: string = "MouseCapture";
  public enableInputEventsEscaping: boolean = true;

  private $mouseSensor = CreateWidgetRef<MouseSensor>();

  public _Update(): void {
    const $mouseSensor = this.$mouseSensor.current;
    if ($mouseSensor) {
      const { isPickingNode } = DevToolsContext.Of(this);
      $mouseSensor.enableInputEventsEscaping = !isPickingNode;
    }
  }

  protected _Render(): Widget | null {
    const { onPlayerMouseClick, onPlayerMouseMove } = this.options;

    return new MouseSensor({
      ref: this.$mouseSensor,
      width: "stretch",
      height: "stretch",
      onMove: onPlayerMouseMove,
      onClick: onPlayerMouseClick,
    });
  }
}
