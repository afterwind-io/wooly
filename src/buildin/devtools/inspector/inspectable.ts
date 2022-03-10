const InspectorMetaKey = Symbol("wooly-inspector-property");

interface InspectableNode {
  [InspectorMetaKey]?: InspectorMeta;
}

/**
 * 描述所有可调试内容的元信息
 */
interface InspectorMeta {
  properties?: InspectorPropertyMeta[];
}

/**
 * 描述可调试字段的元信息
 */
export interface InspectorPropertyMeta {
  /**
   * 字段名称
   */
  name: string;
  /**
   * 显示在调试器上的字段名称
   */
  label: string;
}

/**
 * 从对象构造器上获取所有可调式字段的元信息
 *
 * @param constructor 调试对象的构造器
 * @returns
 */
export function GetInspectorPropertyMeta(
  constructor: any
): InspectorPropertyMeta[] {
  const target = constructor.prototype as InspectableNode;
  return target[InspectorMetaKey]?.properties || [];
}

interface InspectorPropertyOptions {
  /**
   * 显示在调试器上的字段名称。如果不设置，则自动取字段原本的名称。
   */
  alias?: string;
}

/**
 * [**Decorator**]
 *
 * 定义一个可调式字段。
 *
 * 该字段的值将会显示在调试器节点详情中。
 *
 * @param options 相关选项
 */
export function InspectorProperty(options: InspectorPropertyOptions = {}) {
  return function (target: any, propertyKey: string): void {
    let meta = target[InspectorMetaKey];
    if (!meta) {
      meta = target[InspectorMetaKey] = {};
    }

    let properties = meta.properties;
    if (!properties) {
      properties = meta.properties = [];
    }

    properties.push({
      name: propertyKey,
      label: options.alias || propertyKey,
    });
  };
}
