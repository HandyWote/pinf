// 宽松兜底，避免 React Native 类型不兼容导致的 JSX 报错
declare namespace JSX {
  interface ElementClass {
    render?: any;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
