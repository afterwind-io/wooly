/**
 * [**Decorator**]
 */
export function OneTimeCachedGetter(options: { emptyValue: unknown }) {
  const { emptyValue } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    let cachedValue: unknown = emptyValue;

    let originalGetter = descriptor.get!;
    descriptor.get = function (this): unknown {
      if (cachedValue != emptyValue) {
        return cachedValue;
      }

      cachedValue = originalGetter.call(this);
      return cachedValue;
    };
  };
}
