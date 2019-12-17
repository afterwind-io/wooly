import {
  CollisionLayer,
  CollisionMask,
  CollisionType,
  COLLISION_CIRCLE,
  COLLISION_RECTANGLE
} from "./type";
import { Memorize, GetRectangleVertices } from "./util";
import { IsOverlapsedByAABB } from "./aabb";
import { IsOverlapsedBySAT } from "./sat";
import { Entity } from "../../core/entity";
import { Vector2 } from "../../util/vector2";

const CollisionLayers: number[] = [];
const CollisionLayerMap: Record<number, Collision[]> = {};

export class Collision extends Entity {
  public type: CollisionType = COLLISION_CIRCLE;
  public radius: number = 0;
  public layer!: CollisionLayer;
  public mask: CollisionMask = -1;
  public owner: Entity | null = null;

  private rectVerticesGetter: (
    w: number,
    h: number,
    position: Vector2,
    rotation: number,
    scale: Vector2
  ) => Vector2[];

  public constructor() {
    super();

    this.visible = false;

    this.rectVerticesGetter = Memorize(GetRectangleVertices);
    this.SetLayer(0);
  }

  public get Vertices(): Vector2[] {
    if (this.type === COLLISION_RECTANGLE) {
      return this.rectVerticesGetter(
        this.w,
        this.h,
        this.GlobalPosition,
        this.GlobalRotation,
        this.GlobalScale
      );
    }

    return [];
  }

  public _Destroy() {
    this.RemoveFromMap();
  }

  // #!if debug
  public _Draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible) {
      return;
    }

    ctx.fillStyle = "rgba(255, 125, 0, 0.5)";
    ctx.beginPath();

    if (this.type === COLLISION_CIRCLE) {
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    }

    if (this.type === COLLISION_RECTANGLE) {
      ctx.moveTo(0, 0);
      ctx.lineTo(this.w, 0);
      ctx.lineTo(this.w, this.h);
      ctx.lineTo(0, this.h);
    }
    ctx.fill();
  }
  // #!endif

  public GetCollisions(): Collision[] {
    let collisions = [];

    for (const layer of CollisionLayers) {
      if (this.mask === -1 || this.mask & layer) {
        for (const obj of CollisionLayerMap[layer]) {
          obj !== this && this.IsCollidedWith(obj) && collisions.push(obj);
        }
      }
    }

    return collisions;
  }

  public SetRadius(r: number): this {
    return (this.radius = r), this;
  }

  public SetLayer(l: CollisionLayer): this {
    if (l !== this.layer) {
      this.RemoveFromMap();
    } else {
      return this;
    }

    if (!CollisionLayers.includes(l)) {
      CollisionLayers.push(l);
    }

    if (!CollisionLayerMap[l]) {
      CollisionLayerMap[l] = [];
    }

    CollisionLayerMap[l].push(this);
    return (this.layer = l), this;
  }

  public SetMask(m: number): this {
    return (this.mask = m), this;
  }

  public SetOwner(o: Entity): this {
    return (this.owner = o), this;
  }

  public SetType(t: CollisionType): this {
    return (this.type = t), this;
  }

  private IsCollidedWith(target: Collision): boolean {
    if (this.type === COLLISION_CIRCLE && target.type === COLLISION_CIRCLE) {
      return this.TestCircle2Circle(target);
    }

    return this.TestPolygon2Any(target);
  }

  private RemoveFromMap() {
    const layer = CollisionLayerMap[this.layer];
    if (!layer) {
      return;
    }

    const index = layer.findIndex(o => o === this);
    index !== -1 && CollisionLayerMap[this.layer].splice(index, 1);
  }

  private TestCircle2Circle(target: Collision): boolean {
    return (
      this.GlobalPosition.DistanceTo(target.GlobalPosition) <=
      this.radius + target.radius
    );
  }

  private TestPolygon2Any(target: Collision): boolean {
    if (!IsOverlapsedByAABB(this, target)) {
      return false;
    }
    if (!IsOverlapsedBySAT(this, target)) {
      return false;
    }

    return true;
  }
}
