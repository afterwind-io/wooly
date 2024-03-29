import { CanvasItem } from "./canvasItem";
import { Signal } from "./signal";
import { ParamType } from "../util/common";
import { Vector2 } from "../util/vector2";
import { GetUniqId } from "../util/idgen";
import {
  EntityInputEvent,
  GlobalDragDropState,
  MouseState,
} from "./manager/input";

/**
 * The global entity group map.
 *
 * It stores all group information generated
 * throughout the lifecycle of the game.
 */
const EntityGroupMap: Record<string, Entity[]> = {};

/**
 * Build-in signal definitions.
 *
 * If your game entity has its own signals, you may consider writing you own
 * definitions extends this interface, then provided as `Entity` signal type
 * parameter, to gain more accurate IntelliSense experience.
 *
 * @example
 * ```typescript
 * interface MySignals extends EntitySignals {
 *   MyEvent: () => void;
 * }
 *
 * class MyEntity extends Entity<MySignals> {}
 * ```
 * @export
 * @interface EntitySignals
 */
export interface EntitySignals {
  /**
   * A handy signal to present the situation when an `Entity` need to be added
   * to somewhere in the tree.
   *
   * @tutorial
   * For example, when the `player` emits `bullet`, you can't simply add `bullet`
   * as the child of the `player`, because the `bullet` then moves relative to
   * the position of the `player`, which may not what you want.
   *
   * Instead, you can make a virtual anchor as the sibling of the `player`, then
   * connect to the `OnEmitEntity` signal of the `player`. Now every time you
   * need a `bullet`, just call `Emit` on the `player`, pass the bullet instance
   * and it is all done.
   *
   * @memberof EntitySignals
   */
  OnEmitEntity: (entity: Entity) => void;

  /**
   * This signal emits once right after the `_Destroy` phase of the `Entity`.
   * You can hook into it to do some additional house keeping.
   *
   * @memberof EntitySignals
   */
  OnDestroy: () => void;
}

type EntitySignalsMixin<SIG extends {}> = EntitySignals & SIG;

/**
 * The base class of everything (almost) in the game.
 *
 * @export
 * @abstract
 * @class Entity
 * @extends {CanvasItem}
 * @template SIG The type definition of the signals the `Entity` can emit.
 */
export abstract class Entity<SIG = {}> extends CanvasItem {
  /**
   * Indicates whether to receive input events through `_Input` lifecycle method.
   *
   * @example
   * ```typescript
   * export class MyEntity extends Entity {
   *   // Directly declare a property...
   *   public readonly enableInputEvents: boolean = true;
   *
   *   public _Input(event: EntityInputEvent): false | void {
   *     // ...If you need some input events
   *   }
   * }
   * ```
   */
  public readonly enableInputEvents: boolean = false;
  /**
   * Indicates whether to continue the hit tests of the
   * entities below even if the current entity hit (a.k.a click-through).
   */
  public enableInputEventsEscaping: boolean = false;

  /**
   * Defines whether the entity can be dragged or not.
   *
   * @default false
   */
  public draggable: boolean = false;

  /**
   * Defines whether the entity is a valid drop target.
   *
   * @default false
   */
  public droppable: boolean = false;

  /**
   * The unique id.
   *
   * @type {number}
   * @memberof Entity
   */
  public id: number = GetUniqId();

  /**
   * The name of the node.
   *
   * Currently it is only for debug purpose.
   *
   * @type {string}
   * @memberof Entity
   */
  public name: string = "";

  /**
   * A flag indicates whether to update the entity or not.
   *
   * When set to `true`, the `_Update` cycle of the entity and its descendants
   * is skipped, but they still get drawn.
   *
   * @type {boolean}
   * @memberof Entity
   */
  public paused: boolean = false;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The state machine for mouse events.
   */
  public _mouseState: MouseState = new MouseState(this);

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * An array to store all the group names which the node is currently belongs.
   *
   * @private
   * @type {string[]}
   * @memberof Entity
   */
  private groups: string[] = [];

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The inner `Signal` instance.
   *
   * @private
   * @memberof Entity
   */
  private signals: Signal<EntitySignalsMixin<SIG>> = new Signal();

  /**
   * Get the Orientation of the node.
   *
   * Note that the "forward" here is actually the right side of the node,
   * more precisely, the direction of `Vector2D(1, 0)`.
   *
   * @readonly
   * @type {Vector2}
   * @memberof Entity
   */
  public get Orientation(): Vector2 {
    return Vector2.Right.Rotate(this.rotation);
  }

  /**
   * And self to the specified group.
   *
   * @param {string} name The name of the group.
   * @memberof Entity
   */
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

  public Connect<S extends keyof EntitySignalsMixin<SIG>>(
    signal: S,
    handler: EntitySignalsMixin<SIG>[S],
    context?: any
  ) {
    this.signals.Connect(signal, handler, context);
  }

  public Emit<S extends keyof EntitySignalsMixin<SIG>>(
    signal: S,
    ...args: ParamType<EntitySignalsMixin<SIG>[S]>
  ) {
    this.signals.EmitWithWarning(signal, ...args);
  }

  public GetDisplayName(): string {
    return this.name || this.constructor.name;
  }

  /**
   * Get all Entities from the specified group.
   *
   * @param {string} name The name of the group.
   * @returns {Entity[]} The collection of Entities.
   * @memberof Entity
   */
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

  /**
   * A helper method to rotate the node towards the target point.
   *
   * Note that the "forward" here is actually the right side of the node,
   * more precisely, the direction of `Vector2D(1, 0)`.
   *
   * @param {Vector2} t
   * The target point.
   * Beware that the coordinate here should be `GlobalPosition`.
   * @memberof Entity
   */
  public LookAt(t: Vector2) {
    this.SetRotation(this.globalPosition.AngleTo(t));
  }

  /**
   * Remove self from the specified group.
   *
   * @param {string} name The name of group.
   * @memberof Entity
   */
  public RemoveFromGroup(name: string) {
    if (!this.groups.includes(name)) {
      return;
    }

    this.groups.splice(this.groups.indexOf(name), 1);
    EntityGroupMap[name].splice(EntityGroupMap[name].indexOf(this), 1);
  }

  /**
   * Set the name of the `Entity`.
   *
   * @param {string} name The name.
   * @returns {this} This instance of the entity.
   * @memberof Entity
   */
  public SetName(name: string): this {
    return (this.name = name), this;
  }

  /**
   * Set the value of `paused` property
   *
   * @param {boolean} f The flag.
   * @returns {this} This instance of the entity.
   * @memberof Entity
   */
  public SetPaused(f: boolean): this {
    return (this.paused = f), this;
  }

  /**
   * Set the size of the `Entity`.
   *
   * @param {number} w The width, or the size along x-axis.
   * @param {number} h The height, or the size along y-axis.
   * @returns {this} This instance of the entity.
   * @memberof Entity
   */
  public SetSize(w: number, h: number): this {
    return (this.width = w), (this.height = h), this;
  }

  /**
   * [**Lifecycle**]
   * Called on input event occurs iif `enableInputEvents` set to `true`.
   *
   * @param event An object represents the detail of the triggered event.
   * @returns If returns false, the propagation of the events will be stopped.
   */
  public _Input(event: EntityInputEvent): false | void {}

  /**
   * [**Lifecycle**]
   * Called on every update.
   *
   * @param {number} delta The last delta time.
   * @memberof Entity
   */
  public _Update(delta: number) {}

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * A destroy events hook for derived class to do their own house keeping.
   *
   * @memberof Entity
   */
  protected $SelfDestroy() {
    if (this.IsDestroyed) {
      return;
    }

    if (this.enableInputEvents) {
      this._mouseState.Step(false, false, (event) =>
        this._Input(new EntityInputEvent(this, event, GlobalDragDropState))
      );
    }

    // @ts-ignore
    this.signals.Emit("OnDestroy");

    this.signals.Clear();

    for (const group of this.groups) {
      this.RemoveFromGroup(group);
    }

    super.$SelfDestroy();
  }
}
