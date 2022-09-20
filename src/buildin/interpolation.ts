/**
 * Credits to https://github.com/tweenjs/tween.js for the easing functions.
 */

import { Identity } from "../util/common";

type InterpolationFunction = (amount: number) => number;

export function Interpolate(
  method: InterpolationMethod,
  start: number,
  end: number,
  amount: number
): number {
  return start + (end - start) * GetInterpolationMethod(method)(amount);
}

export const enum InterpolationMethod {
  None,
  Linear,
  QuadraticIn,
  QuadraticOut,
  QuadraticInOut,
  CircularIn,
  CircularOut,
  CircularInOut,
}

export function GetInterpolationMethod(
  method: InterpolationMethod = InterpolationMethod.None
): InterpolationFunction {
  switch (method) {
    case InterpolationMethod.None:
      return None;
    case InterpolationMethod.Linear:
      return Identity;
    case InterpolationMethod.QuadraticIn:
      return QuadraticIn;
    case InterpolationMethod.QuadraticOut:
      return QuadraticOut;
    case InterpolationMethod.QuadraticInOut:
      return QuadraticInOut;
    case InterpolationMethod.CircularIn:
      return CircularIn;
    case InterpolationMethod.CircularOut:
      return CircularOut;
    case InterpolationMethod.CircularInOut:
      return CircularInOut;

    default:
      const _: never = method;
      return None;
  }
}

const None: InterpolationFunction = () => 0;

const QuadraticIn: InterpolationFunction = (amount) => {
  return amount * amount;
};

const QuadraticOut: InterpolationFunction = (amount) => {
  return amount * (2 - amount);
};

const QuadraticInOut: InterpolationFunction = (amount) => {
  if (amount === 0) {
    return 0;
  }

  if (amount === 1) {
    return 1;
  }

  if ((amount *= 2) < 1) {
    return 0.5 * Math.pow(1024, amount - 1);
  }

  return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
};

const CircularIn: InterpolationFunction = (amount) => {
  return 1 - Math.sqrt(1 - amount * amount);
};

const CircularOut: InterpolationFunction = (amount) => {
  return Math.sqrt(1 - --amount * amount);
};

const CircularInOut: InterpolationFunction = (amount) => {
  if ((amount *= 2) < 1) {
    return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
  }

  return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
};
