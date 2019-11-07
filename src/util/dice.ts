export const Dice = {
  /**
   * Check against the specified probability.
   *
   * @param {number} p probability
   * @returns {boolean}
   */
  Check(p: number): boolean {
    return this.Next() <= p;
  },

  /**
   * Get a random float number between [0,1).
   *
   * @returns {number} the random number
   */
  Next(): number {
    return Math.random();
  },

  /**
   * Get a random float number between [`from`, `to`).
   *
   * @param {number} from the floor of the range
   * @param {number} to the ceiling of the range
   * @returns {number} the random number
   */
  NextFloat(from: number, to: number): number {
    return this.Next() * (to - from) + from;
  },

  /**
   * Get a random integer between [`from`, `to`).
   *
   * @param {number} from the floor of the range
   * @param {number} to the ceiling of the range
   * @returns {number} the random number
   */
  NextInt(from: number, to: number): number {
    return Math.floor(this.NextFloat(from, to));
  }
};
