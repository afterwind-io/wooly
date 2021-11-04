import { Control, ControlSignals, ControlStyle } from './base';
import { LineBreak } from './lineBreak';
import { Entity } from '../../core/entity';
import { Vector2 } from '../../util/vector2';
import { Constraint } from './common/constraint';
import { Size } from './common/types';
import { Edge } from './common/edge';

interface PanelStyleDeclaration extends ControlStyle {
  textWrap?: boolean;
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export class Panel extends Control<ControlSignals> {
  public readonly customDrawing: boolean = true;

  public style: Required<PanelStyleDeclaration> = {
    cursor: 'default',
    padding: new Edge(),
    margin: new Edge(),
    width: 'strech',
    height: 'strech',
    textWrap: true,
    verticalAlign: 'top',
  };

  public _Draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeRect(0, 0, this.w, this.h);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    // @ts-ignore
    ctx.fillText('Panel - ' + this.parent.name, 0, -4);
  }

  public _Update() {
    this.Layout();
  }

  public _Layout(constraint: Constraint): Size {
    // TODO
    return { width: 0, height: 0 };
  }

  private Layout() {
    const { padding, textWrap, verticalAlign } = this.style;

    let children: Entity[] = [...this.children] as Entity[];

    // FIXME
    let iter = 0;

    let top: number = padding.top;
    while (children.length !== 0) {
      if (iter > 100) {
        throw new Error('Panel: ?????');
      }

      const lineNodes = PickLine(children, this.w, textWrap);
      const lineHeight = GetLineHeight(lineNodes);

      let left: number = padding.left;
      for (const node of lineNodes) {
        let dy: number = 0;

        if (verticalAlign === 'top') {
          dy = 0;
        } else if (verticalAlign === 'bottom') {
          dy = lineHeight - node.h;
        } else {
          dy = (lineHeight - node.h) / 2;
        }

        node.SetPosition(new Vector2(left, top + dy));
        left += node.w;
      }

      top += lineHeight;
      children = children.slice(lineNodes.length);
      iter++;
    }
  }
}

function GetLineHeight(nodes: Entity[]): number {
  const heights = nodes.map((n) => n.h);
  return Math.max(...heights);
}

function PickLine(
  nodes: Entity[],
  maxWidth: number,
  wrap: boolean = true
): Entity[] {
  if (!wrap) {
    return nodes;
  }

  let width: number = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node instanceof LineBreak) {
      return nodes.slice(0, i + 1);
    }

    if (width + node.w > maxWidth) {
      if (i === 0) {
        /**
         * 如果单一元素的宽度超过了行宽，则不作处理
         */
        return nodes.slice(1);
      } else {
        return nodes.slice(0, i);
      }
    }

    width += node.w;
  }

  return nodes;
}
