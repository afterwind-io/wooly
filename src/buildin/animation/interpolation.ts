import { Identity } from '../../util/common';

export const enum InterpolationMethod {
  None,
  Linear,
}

export function GetInterpolationMethod(
  method: InterpolationMethod = InterpolationMethod.None
) {
  switch (method) {
    case InterpolationMethod.None:
      return Identity;
    case InterpolationMethod.Linear:
      return LinearInterpolation;

    default:
      const _: never = method;
      return Identity;
  }
}

function LinearInterpolation(
  b: number,
  c: number,
  t: number,
  d: number
): number {
  return (c * t) / d + b;
}
