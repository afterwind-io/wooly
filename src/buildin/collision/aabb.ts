import { Collision } from ".";
import { COLLISION_CIRCLE } from "./type";
import { GetIntersectionLength, IsIntersected } from "./util";
import { Vector2 } from "../../util/vector2";

export function IsOverlapsedByAABB(c1: Collision, c2: Collision): boolean {
  const aabb1 = GetAABB(c1);
  const aabb2 = GetAABB(c2);

  const ix = GetIntersectionLength(
    aabb1.min.x,
    aabb1.max.x,
    aabb2.min.x,
    aabb2.max.x
  );
  const iy = GetIntersectionLength(
    aabb1.min.y,
    aabb1.max.y,
    aabb2.min.y,
    aabb2.max.y
  );

  return IsIntersected(ix) && IsIntersected(iy);
}

function GetAABB(c: Collision): { min: Vector2; max: Vector2 } {
  if (c.type === COLLISION_CIRCLE) {
    return GetCircleAABB(c.GlobalPosition, c.radius);
  }

  return GetPolygonAABB(c.Vertices);
}

function GetCircleAABB(
  center: Vector2,
  radius: number
): { min: Vector2; max: Vector2 } {
  return {
    min: new Vector2(center.x - radius, center.y - radius),
    max: new Vector2(center.x + radius, center.y + radius)
  };
}

function GetPolygonAABB(vertices: Vector2[]): { min: Vector2; max: Vector2 } {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const vertex of vertices) {
    if (vertex.x < minX) minX = vertex.x;
    else if (vertex.x > maxX) maxX = vertex.x;
    if (vertex.y < minY) minY = vertex.y;
    else if (vertex.y > maxY) maxY = vertex.y;
  }

  return { min: new Vector2(minX, minY), max: new Vector2(maxX, maxY) };
}
