import { Widget } from "./widget";

/**
 * [**Decorator**]
 *
 * Auto call `this.Refresh` after execution and bind the method to `this`.
 *
 * ```ts
 * class MyWidget extends Widget {
 *   `@Reactive`
 *   public DoSomething {
 *     this.a = 1;
 *   }
 * }
 * ```
 *
 * ...which is equivalent to:
 * ```ts
 * class MyWidget extends Widget {
 *   public constructor() {
 *     this.DoSomething = this.DoSomething.bind(this);
 *   }
 *
 *   public DoSomething {
 *     this.a = 1;
 *     this.Refresh();
 *   }
 * }
 * ```
 */
export function Reactive(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
): PropertyDescriptor {
  return {
    configurable: true,
    get(this: Widget & Record<string, unknown>) {
      const self = this;

      const originalMethod = descriptor.value!;
      const boundMethod = function (...args: any[]) {
        originalMethod.apply(self, args);
        self.Refresh();
      }.bind(self);

      // 不能Object.defineProperty，因为绑定的方法可能是重载基类绑定过的方法
      this[propertyKey] = boundMethod;

      return boundMethod;
    },
  };
}
