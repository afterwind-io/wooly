import { Signal } from "./signal";
import { Vector2 } from "../util/vector2";

type ParamType<T> = T extends (...args: infer R) => void ? R : any[];

const EntityGroupMap: Record<string, Entity[]> = {};

export interface EntitySignals {
  OnEmitEntity: (surprise: Entity) => void;
  OnDestroy: () => void;
}

export abstract class Entity<SIGNALS extends EntitySignals = EntitySignals> {
  public id: number = 0;
  public name: string = "";

  public w: number = 0;
  public h: number = 0;

  public position: Vector2 = new Vector2();
  public scale: Vector2 = new Vector2(1, 1);
  public rotation: number = 0;

  public visible: boolean = true;

  public parent: Entity | null = null;
  public children: Entity[] = [];

  public groups: string[] = [];

  protected isDestoryed: boolean = false;

  private signals: Signal = new Signal();

  public get GlobalPosition(): Vector2 {
    if (!this.parent) {
      return this.position;
    } else {
      return this.position
        .Dot(this.parent.GlobalScale)
        .Rotate(this.parent.GlobalRotation)
        .Add(this.parent.GlobalPosition);
    }
  }

  public get GlobalRotation(): number {
    if (!this.parent) {
      return this.rotation;
    } else {
      return this.rotation + this.parent.GlobalRotation;
    }
  }

  public get GlobalScale(): Vector2 {
    if (!this.parent) {
      return this.scale;
    } else {
      return this.scale.Dot(this.parent.GlobalScale);
    }
  }

  public get Orientation(): Vector2 {
    return Vector2.Right.Rotate(this.rotation);
  }

  public $Tick(ctx: CanvasRenderingContext2D, delta: number) {
    this.$Update(delta);
    this.$Draw(ctx);
  }

  public AddChild(entity: Entity) {
    entity.parent = this;
    this.children.push(entity);
    entity._Ready();
  }

  public AddToGroup(name: string) {
    if (this.groups.includes(name)) {
      return;
    }

    if (!EntityGroupMap[name]) {
      EntityGroupMap[name] = [];
    }

    if (!EntityGroupMap[name].includes(this)) {
      EntityGroupMap[name].push(this);
      this.groups.push(name);
    }
  }

  public Connect<S extends keyof SIGNALS>(
    signal: S,
    cb: SIGNALS[S],
    bind?: any
  ) {
    // #!if debug
    if (typeof cb !== "function") {
      throw new Error("Not a function!");
    }
    // #!endif

    this.signals.Add(signal as string, cb.bind(bind));
  }

  public Emit<S extends keyof SIGNALS>(
    signal: S,
    ...args: ParamType<SIGNALS[S]>
  ) {
    this.signals.Emit(signal as string, ...args);
  }

  /**
   * Synchronously remove self and its descendants from the Entity Tree.
   *
   * @returns
   * @memberof Entity
   */
  public Free() {
    if (this.isDestoryed) {
      return;
    }

    if (this.parent) {
      this.parent.RemoveChild(this);
    }

    this.$Destory();
  }

  public GetFromGroup(name: string): Entity[] {
    return EntityGroupMap[name] || [];
  }

  /**
   * Check is self in the specified group.
   *
   * @param {string} name Target group name.
   * @returns {boolean} The result.
   * @memberof Entity
   */
  public IsInGroup(name: string): boolean {
    return this.groups.includes(name);
  }

  public LookAt(t: Vector2) {
    this.SetRotation(this.GlobalPosition.AngleTo(t));
  }

  public RemoveChild(entity: Entity) {
    const index = this.children.findIndex(c => c === entity);
    if (index === -1) {
      return;
    }
    this.children.splice(index, 1);
  }

  public RemoveFromGroup(name: string) {
    if (!this.groups.includes(name)) {
      return;
    }

    this.groups.splice(this.groups.indexOf(name), 1);
    EntityGroupMap[name].splice(EntityGroupMap[name].indexOf(this), 1);
  }

  public Rotate(rad: number) {
    this.rotation += rad;
  }

  public Scale(sx: number, sy: number = sx) {
    this.scale.x = this.scale.x * sx;
    this.scale.y = this.scale.y * sy;
  }

  public SetName(name: string): this {
    return (this.name = name), this;
  }

  /**
   * Set the local position by vector.
   *
   * @param {Vector2} pos Local position vector.
   * @returns {this}
   * @memberof Entity
   */
  public SetPosition(pos: Vector2): this;
  /**
   * Set the local position by specified value.
   *
   * @param {number} x The position on the x-axis.
   * @param {number} y The position on the y-axis.
   * @returns {this}
   * @memberof Entity
   */
  public SetPosition(x: number, y: number): this;
  public SetPosition(p1: number | Vector2, p2?: number) {
    let pos: Vector2;
    if (p1 instanceof Vector2) {
      pos = p1;
    } else {
      pos = new Vector2(p1, p2);
    }
    return (this.position = pos), this;
  }

  public SetRotation(rad: number): this {
    return (this.rotation = rad), this;
  }

  public SetScale(scale: Vector2): this {
    return (this.scale = scale), this;
  }

  public SetSize(w: number, h: number): this {
    return (this.w = w), (this.h = h), this;
  }

  public SetVisible(f: boolean): this {
    return (this.visible = f), this;
  }

  /**
   * Translate the entity by vector.
   *
   * @param {Vector2} v The offset vector.
   * @memberof Entity
   */
  public Translate(v: Vector2): void;
  /**
   * Translate the entity by specified value.
   *
   * @param {number} x The offset along x-axis.
   * @param {number} y The offset along y-axis.
   * @memberof Entity
   */
  public Translate(x: number, y: number): void;
  public Translate(x: number | Vector2, y?: number) {
    let delta: Vector2;
    if (x instanceof Vector2) {
      delta = x;
    } else {
      delta = new Vector2(x, y);
    }

    this.position = this.position.Add(delta);
  }

  /**
   * [Lifecycle]
   * Called once before `Entity` removed from the tree.
   *
   * @protected
   * @memberof Entity
   */
  protected _Destory() {}

  /**
   * [Lifecycle]
   * Called on every draw updates, after the `_Update` call.
   *
   * @protected
   * @param {CanvasRenderingContext2D} ctx The `canvas` context.
   * @memberof Entity
   */
  protected _Draw(ctx: CanvasRenderingContext2D) {}

  /**
   * [Lifecycle]
   * Called once right after `Entity` added to the tree.
   *
   * @protected
   * @memberof Entity
   */
  protected _Ready() {}

  /**
   * [Lifecycle]
   * Called on every update.
   *
   * @protected
   * @param {number} delta The last delta time.
   * @memberof Entity
   */
  protected _Update(delta: number) {}

  private $Destory() {
    this.parent = null;

    this.signals.Emit("OnDestroy");
    this.signals.Clear();

    for (const group of this.groups) {
      this.RemoveFromGroup(group);
    }

    this._Destory();

    for (const child of this.children) {
      child.$Destory();
    }

    this.isDestoryed = true;
  }

  private $Draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale.x, this.scale.y);

    ctx.save();
    this.visible && this._Draw(ctx);
    ctx.restore();

    if (this.visible) {
      for (const child of this.children) {
        child.$Draw(ctx);
      }
    }

    ctx.restore();
  }

  private $Update(delta: number) {
    this._Update(delta);

    for (const child of this.children) {
      child.$Update(delta);
    }
  }
}
