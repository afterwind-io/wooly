import { Collision } from ".";
import { COLLISION_CIRCLE } from "./type";
import { GetIntersectionLength, IsIntersected } from "./util";
import { Vector2 } from "../..//util/vector2";

export function IsOverlapsedBySAT(c1: Collision, c2: Collision): boolean {
  if (!IsOverlapsed(GetTestAxis(c1, c2), c1, c2)) {
    return false;
  }

  if (!IsOverlapsed(GetTestAxis(c2, c1), c1, c2)) {
    return false;
  }

  return true;
}

function IsOverlapsed(axiss: Vector2[], c1: Collision, c2: Collision): boolean {
  for (const axis of axiss) {
    const myProjection = ProjectOntoAxis(c1, axis);
    const thProjection = ProjectOntoAxis(c2, axis);

    const intersection = GetIntersectionLength(
      myProjection.min,
      myProjection.max,
      thProjection.min,
      thProjection.max
    );

    if (!IsIntersected(intersection)) {
      return false;
    }
  }

  return true;
}

function GetTestVertices(c: Collision) {
  return c.type === COLLISION_CIRCLE ? [c.GlobalPosition] : c.Vertices;
}

function GetTestAxis(c1: Collision, c2: Collision): Vector2[] {
  if (c1.type === COLLISION_CIRCLE) {
    const center = c1.GlobalPosition;
    return [center.Substract(GetNearestPoint(center, c2.Vertices)).Normalize()];
  }

  return GetEdges(c1.Vertices).map(e => e.Normal().Normalize());
}

function GetNearestPoint(target: Vector2, points: Vector2[]): Vector2 {
  let min = Infinity;
  let i = 0;

  for (let j = 0; j < points.length; j++) {
    const p = points[j];
    const d = target.DistanceTo(p);
    if (d < min) {
      min = d;
      i = j;
    }
  }

  return points[i];
}

function GetEdges(vertices: Vector2[]): Vector2[] {
  const edges = [];

  let currentVertex = vertices[0];
  let i = vertices.length;
  while (i--) {
    edges.push(currentVertex.Substract(vertices[i]));
    currentVertex = vertices[i];
  }
  return edges;
}

function ProjectOntoAxis(c: Collision, axis: Vector2) {
  let min: number = Infinity;
  let max: number = -Infinity;

  for (const vertex of GetTestVertices(c)) {
    var length = axis.DotProduct(vertex);
    if (length < min) {
      min = length;
    }
    if (length > max) {
      max = length;
    }
  }

  // NOTE: 如果投影的是个圆形，需要加上半径
  const extend = c.type === COLLISION_CIRCLE ? GetTransformedRadius(c) : 0;
  return { min: min - extend, max: max + extend };
}

function GetTransformedRadius(c: Collision): number {
  // FIXME: 暂时无法支持水平及垂直缩放不一致的情况
  return c.radius * c.GlobalScale.x;
}
