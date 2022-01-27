import {
  CollisionLayer,
  CollisionMask,
  CollisionType,
  COLLISION_CIRCLE,
  COLLISION_RECTANGLE,
} from "./type";
import { Memorize, GetRectangleVertices } from "./util";
import { IsOverlappedByAABB } from "./aabb";
import { IsOverlappedBySAT } from "./sat";
import { Entity } from "../../core/entity";
import { Vector2 } from "../../util/vector2";

const CollisionLayers: number[] = [];
const CollisionLayerMap: Record<number, Collision[]> = {};

export class Collision extends Entity {
  public readonly enableDrawing: boolean = true;

  public type: CollisionType = COLLISION_CIRCLE;
  public radius: number = 0;
  public collisionLayer!: CollisionLayer;
  public collisionMask: CollisionMask = -1;
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
    this.SetCollisionLayer(0);
  }

  public get Vertices(): Vector2[] {
    if (this.type === COLLISION_RECTANGLE) {
      return this.rectVerticesGetter(
        this.width,
        this.height,
        this.globalPosition,
        this.globalRotation,
        this.globalScale
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
      ctx.lineTo(this.width, 0);
      ctx.lineTo(this.width, this.height);
      ctx.lineTo(0, this.height);
    }
    ctx.fill();
  }
  // #!endif

  public GetCollisions(): Collision[] {
    let collisions = [];

    for (const layer of CollisionLayers) {
      if (this.collisionMask === -1 || this.collisionMask & layer) {
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

  public SetCollisionLayer(l: CollisionLayer): this {
    if (l !== this.collisionLayer) {
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
    return (this.collisionLayer = l), this;
  }

  public SetCollisionMask(m: number): this {
    return (this.collisionMask = m), this;
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
    const layer = CollisionLayerMap[this.collisionLayer];
    if (!layer) {
      return;
    }

    const index = layer.findIndex((o) => o === this);
    index !== -1 && CollisionLayerMap[this.collisionLayer].splice(index, 1);
  }

  private TestCircle2Circle(target: Collision): boolean {
    return (
      this.globalPosition.DistanceTo(target.globalPosition) <=
      this.radius + target.radius
    );
  }

  private TestPolygon2Any(target: Collision): boolean {
    if (!IsOverlappedByAABB(this, target)) {
      return false;
    }
    if (!IsOverlappedBySAT(this, target)) {
      return false;
    }

    return true;
  }
}
