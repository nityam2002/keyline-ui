/** the value, which the test knows is there: throws (failing the test) when it is missing */
export function defined<T>(x: T | undefined, what = "value"): T {
  if (x === undefined) throw new Error(`expected a ${what}, got undefined`);
  return x;
}
