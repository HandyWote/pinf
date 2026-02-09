import * as React from 'react';

// 从官方导出的组件类型推导 Props，再用 ComponentType 重新导出，避免新建 class 覆盖
type RNExports = typeof import('react-native');
type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never;

declare module 'react-native' {
  export const View: React.ComponentType<PropsOf<RNExports['View']>>;
  export const ScrollView: React.ComponentType<PropsOf<RNExports['ScrollView']>>;
  export const ImageBackground: React.ComponentType<PropsOf<RNExports['ImageBackground']>>;
  export const Text: React.ComponentType<PropsOf<RNExports['Text']>>;
  export const TextInput: React.ComponentType<PropsOf<RNExports['TextInput']>>;
  export const ActivityIndicator: React.ComponentType<PropsOf<RNExports['ActivityIndicator']>>;
}
