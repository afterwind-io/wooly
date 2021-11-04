继承关系：
`Entity` < `CanvasItem` < `Node`

## `Engine`

渲染树的结构：

- [有序链表] CanvasLayer
  - [有序链表] ZIndex-Stack
    - [链表] Node

每个CanvasLayer以`LayerIndex`为索引在`ViewportRegistry`中对应一个`Viewport`，用以控制"镜头"。


### 更新(Update)

沿根`Entity`进行深度优先遍历，调用各节点的`$Update`方法。

### 渲染(Draw)

沿`CanvasTree`正序遍历，调用各节点的`$Draw`方法。

## `CanvasItem`

普通树结构，包含深度递归优先顺序的链表结构，用于表达实际的对象结构。
