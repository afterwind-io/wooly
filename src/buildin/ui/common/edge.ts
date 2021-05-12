export class Edge {
  public readonly left: number;
  public readonly right: number;
  public readonly top: number;
  public readonly bottom: number;

  public static get None(): Edge {
    return new Edge();
  }

  public static All(width: number): Edge {
    return new Edge(width, width, width, width);
  }

  public static Horizontal(width: number): Edge {
    return new Edge(width, width, 0, 0);
  }

  public static Vertical(width: number): Edge {
    return new Edge(0, 0, width, width);
  }

  public static Left(width: number): Edge {
    return new Edge(width, 0, 0, 0);
  }

  public static Right(width: number): Edge {
    return new Edge(0, width, 0, 0);
  }

  public static Top(width: number): Edge {
    return new Edge(0, 0, width, 0);
  }

  public static Bottom(width: number): Edge {
    return new Edge(0, 0, 0, width);
  }

  public constructor(
    left: number = 0,
    right: number = 0,
    top: number = 0,
    bottom: number = 0
  ) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  public get Horizontal(): number {
    return this.left + this.right;
  }

  public get Vertical(): number {
    return this.top + this.bottom;
  }
}
