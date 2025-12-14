declare module 'invariant' {
  export default function invariant(condition: any, message?: string): asserts condition;
}
