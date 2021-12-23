import { Transform } from "./transform";

/**
 * CanvasComposition
 */
export class CanvasComposition extends Transform {
  public readonly name: string = "CanvasComposition";

  public constructor(public readonly index: number) {
    super();
  }
}
