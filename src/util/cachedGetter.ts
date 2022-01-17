/**
 * [**Decorator**]
 */
export function OneTimeCachedGetter(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const cacheKey = Symbol(`_cache_${propertyKey}_`);

  let originalGetter = descriptor.get!;
  descriptor.get = function (this: any): unknown {
    if (!Object.prototype.hasOwnProperty.call(this, cacheKey)) {
      this[cacheKey] = originalGetter.call(this);
    }

    return this[cacheKey];
  };
}
