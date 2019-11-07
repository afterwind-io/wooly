/**
 * 碰撞体所在的层定义
 *
 * 配合CollisionMask通过`&`位运算判断是否可与目标对象进行碰撞。
 * 如果设置为0，则意味着永远不与任何对象碰撞。
 * 目前预置了10层，可根据需要扩展，最大30层。(1 << 30)
 */
export type CollisionLayer = 0 | 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512;

/**
 * 可以进行碰撞的层的掩码定义
 *
 * 如果设置为-1，代表检测所有layer；
 * 如果设置为0，则意味着永远不检测任何碰撞；
 */
export type CollisionMask = number;

/**
 * 碰撞体形状类型
 */
export type CollisionType = 0 | 1;
export const COLLISION_CIRCLE: CollisionType = 0;
export const COLLISION_RECTANGLE: CollisionType = 1;
// export const COLLISION_POLYGON: CollisionType = 2;
