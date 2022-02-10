/**
 * [**Decorator**]
 * 
 * 包装一个类的getter，只会在第一次访问时调用装饰的getter，并将该值永久缓存。
 * 后续访问只会返回最初的缓存值。
 */
export function PersistCached(
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
