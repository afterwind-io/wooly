import { Entity, EntitySignals } from '../../../core/entity';
import { Input } from '../../media/input';
import { Vector2 } from '../../../util/vector2';
import { Size, Length } from '../common/types';
import { Constraint } from '../common/constraint';
import { Edge } from '../common/edge';
import {
  MouseAction,
  MouseDragDrop,
  MouseMovement,
  CommonWidgetOptions,
  MultiChildWidgetOptions,
  ContainerWidgetOptions,
} from './types';

const DRAG_START_THRESHOLD = 10;

const DragDropState = new (class DragDropState {
  public data: any = null;
  public dragStartPos: Vector2 = new Vector2();
  public source: Entity | null = null;

  public get IsDragging(): boolean {
    return this.source != null;
  }

  public Clear() {
    this.source = null;
    this.data = null;
  }

  public IsStartDragging(pos: Vector2): boolean {
    return this.dragStartPos.DistanceTo(pos) >= DRAG_START_THRESHOLD;
  }

  public SetData(source: Entity, data: any = null) {
    this.source = source;
    this.data = data;
  }

  public SetDragStartPoint(pos: Vector2) {
    this.dragStartPos = pos;
  }

  public GetData(): any {
    return this.data;
  }
})();

export type WidgetOptions = CommonWidgetOptions &
  MultiChildWidgetOptions &
  ContainerWidgetOptions;

export abstract class Widget<
  SIGNAL extends EntitySignals = EntitySignals
> extends Entity<SIGNAL> {
  public readonly customDrawing: boolean = true;

  public _debug: boolean = true;
  public _intrinsicWidth: number = 0;
  public _intrinsicHeight: number = 0;

  public readonly tag: string;
  public border: Edge;
  public padding: Edge;
  public margin: Edge;
  public width: Length;
  public height: Length;

  protected draggable: boolean = false;
  protected mouseActionState: MouseAction = MouseAction.None;
  protected mouseDragDropState: MouseDragDrop = MouseDragDrop.None;
  protected mouseMovementState: MouseMovement = MouseMovement.None;

  public constructor(options: WidgetOptions = {}) {
    super();

    const {
      tag = '',
      children = [],
      border = Edge.None,
      padding = Edge.None,
      margin = Edge.None,
      width = 'shrink',
      height = 'shrink',
    } = options;
    this.tag = tag;
    this.border = border;
    this.padding = padding;
    this.margin = margin;
    this.width = width;
    this.height = height;

    for (const child of children) {
      this.AddChild(child);
    }
  }

  public get IsDragging(): boolean {
    return DragDropState.source === this;
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    this.DebugDraw(ctx);

    this._DrawWidget(ctx);
  }

  public _DrawWidget(ctx: CanvasRenderingContext2D): void {}

  public _Update(delta: number) {
    const nextMovementState = this.StepMouseMovementState();
    this.mouseMovementState = nextMovementState;

    const nextActionState = this.StepMouseActionState();
    this.mouseActionState = nextActionState;

    if (this.draggable) {
      // NOTE 应始终在移动和点击状态更新后执行
      this.HandleDragDrop();
    }
  }

  public _Input(e: InputEvent) {}

  public abstract _Layout(constraint: Constraint): Size;

  protected GetFirstChild(): Widget | null {
    const child = this.children[0];
    if (!child) {
      return null;
    }

    if (!(child instanceof Widget)) {
      throw new Error(
        '[wooly] The child of the "Widget" must be an instance of "Widget".'
      );
    }

    return child as Widget;
  }

  private DebugDraw(ctx: CanvasRenderingContext2D) {
    if (!this._debug) {
      return;
    }

    const w = this._intrinsicWidth;
    const h = this._intrinsicHeight;

    // Dimension
    // ctx.globalAlpha = 0.05;
    // ctx.fillStyle = 'black';
    // ctx.fillRect(0, 0, w, h);
    // ctx.globalAlpha = 1;
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    // ctx.font = '8px sans-serif';
    // ctx.fillText(`${this.name}(${w.toFixed(3)}, ${h.toFixed(3)})`, 2, 10);

    ctx.globalAlpha = 0.3;

    // Margin
    ctx.fillStyle = 'orange';
    ctx.fillRect(0, 0, w, this.margin.top);
    ctx.fillRect(0, h - this.margin.bottom, w, this.margin.bottom);
    ctx.fillRect(
      0,
      this.margin.top,
      this.margin.left,
      h - this.margin.Vertical
    );
    ctx.fillRect(
      w - this.margin.right,
      this.margin.top,
      this.margin.right,
      h - this.margin.Vertical
    );

    // Border
    ctx.fillStyle = 'yellow';
    ctx.fillRect(
      this.margin.left,
      this.margin.top,
      w - this.margin.Horizontal,
      this.border.top
    );
    ctx.fillRect(
      this.margin.left,
      h - this.margin.bottom - this.border.bottom,
      w - this.margin.Horizontal,
      this.border.bottom
    );
    ctx.fillRect(
      this.margin.left,
      this.margin.top + this.border.top,
      this.border.left,
      h - this.margin.Vertical - this.border.Vertical
    );
    ctx.fillRect(
      w - this.margin.right - this.border.right,
      this.margin.top + this.border.top,
      this.border.right,
      h - this.margin.Vertical - this.border.Vertical
    );

    // Padding
    ctx.fillStyle = 'lime';
    ctx.fillRect(
      this.margin.left + this.border.left,
      this.margin.top + this.border.top,
      w - this.margin.Horizontal - this.border.Horizontal,
      this.padding.top
    );
    ctx.fillRect(
      this.margin.left + this.border.left,
      h - this.margin.bottom - this.border.bottom - this.padding.bottom,
      w - this.margin.Horizontal - this.border.Horizontal,
      this.padding.bottom
    );
    ctx.fillRect(
      this.margin.left + this.border.left,
      this.margin.top + this.border.top + this.padding.top,
      this.padding.left,
      h - this.margin.Vertical - this.border.Vertical - this.padding.Vertical
    );
    ctx.fillRect(
      w - this.margin.right - this.border.right - this.padding.right,
      this.margin.top + this.border.top + this.padding.top,
      this.padding.right,
      h - this.margin.Vertical - this.border.Vertical - this.padding.Vertical
    );

    ctx.globalAlpha = 1;
  }

  private HandleDragDrop() {
    this.mouseDragDropState = this.StepMouseDragDropState();

    if (this.mouseDragDropState === MouseDragDrop.DragFocus) {
      DragDropState.SetDragStartPoint(Input.GetMousePosition());
    } else if (this.mouseDragDropState === MouseDragDrop.DragStart) {
      DragDropState.SetData(this);
    } else if (this.mouseDragDropState === MouseDragDrop.DragEnd) {
      DragDropState.Clear();
    }
  }

  private StepMouseActionState() {
    if (this.mouseMovementState === MouseMovement.None) {
      return MouseAction.None;
    }

    switch (this.mouseActionState) {
      case MouseAction.None:
        if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseAction.MouseDown;
        } else {
          return MouseAction.None;
        }

      case MouseAction.MouseDown:
        if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseAction.MouseDown;
        } else {
          return MouseAction.MouseUp;
        }

      case MouseAction.MouseUp:
        return MouseAction.MouseClick;

      case MouseAction.MouseClick:
        return MouseAction.None;

      default:
        return MouseAction.None;
    }
  }

  private StepMouseDragDropState() {
    switch (this.mouseDragDropState) {
      case MouseDragDrop.None:
        if (this.mouseActionState !== MouseAction.MouseDown) {
          return MouseDragDrop.None;
        } else if (this.mouseMovementState !== MouseMovement.MouseHover) {
          return MouseDragDrop.None;
        } else if (DragDropState.IsDragging) {
          return MouseDragDrop.DragEnter;
        } else {
          return MouseDragDrop.DragFocus;
        }

      case MouseDragDrop.DragFocus:
        return MouseDragDrop.DragPending;

      case MouseDragDrop.DragPending:
        if (!Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseDragDrop.None;
        } else if (DragDropState.IsStartDragging(Input.GetMousePosition())) {
          return MouseDragDrop.DragStart;
        } else {
          return MouseDragDrop.DragPending;
        }

      case MouseDragDrop.DragStart:
        if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseDragDrop.DragMove;
        } else {
          return MouseDragDrop.DragEnd;
        }

      case MouseDragDrop.DragEnd:
        return MouseDragDrop.None;

      case MouseDragDrop.DragEnter:
        if (!this.IsMouseWithin(this._intrinsicWidth, this._intrinsicHeight)) {
          return MouseDragDrop.DragLeave;
        } else if (!Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseDragDrop.Drop;
        } else {
          return MouseDragDrop.DragMove;
        }

      case MouseDragDrop.DragLeave:
        return MouseDragDrop.None;

      case MouseDragDrop.DragMove:
        if (this.IsDragging) {
          if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
            return MouseDragDrop.DragMove;
          } else {
            return MouseDragDrop.DragEnd;
          }
        } else {
          if (
            !this.IsMouseWithin(this._intrinsicWidth, this._intrinsicHeight)
          ) {
            return MouseDragDrop.DragLeave;
          } else if (!Input.IsMouseDown(Input.BUTTON_LEFT)) {
            return MouseDragDrop.Drop;
          } else {
            return MouseDragDrop.DragMove;
          }
        }

      case MouseDragDrop.Drop:
        return MouseDragDrop.None;

      default:
        return MouseDragDrop.None;
    }
  }

  private StepMouseMovementState() {
    const isMouseWithin = this.IsMouseWithin(
      this._intrinsicWidth,
      this._intrinsicHeight
    );

    switch (this.mouseMovementState) {
      case MouseMovement.None:
        if (isMouseWithin) {
          return MouseMovement.MouseEnter;
        } else {
          return MouseMovement.None;
        }

      case MouseMovement.MouseEnter:
        if (!isMouseWithin) {
          return MouseMovement.MouseLeave;
        } else {
          return MouseMovement.MouseHover;
        }

      case MouseMovement.MouseHover:
        if (!isMouseWithin) {
          return MouseMovement.MouseLeave;
        } else {
          return MouseMovement.MouseHover;
        }

      case MouseMovement.MouseLeave:
        if (isMouseWithin) {
          return MouseMovement.MouseEnter;
        } else {
          return MouseMovement.None;
        }

      default:
        return MouseMovement.None;
    }
  }
}
