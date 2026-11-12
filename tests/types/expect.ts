// Compile-only assertions: `expectType<T>()(value)` fails to compile unless value's type is exactly T.
type Exact<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2 ? true : false;

export function expectType<T>() {
  return <V>(_value: V & (Exact<T, V> extends true ? unknown : never)): void => {};
}
