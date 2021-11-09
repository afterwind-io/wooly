let id: number = 0;
/**
 * Get a unique, self-increasing id.
 *
 * @export
 * @returns {number}
 */
export function GetUniqId(): number {
  return ++id;
}
