import * as React from 'react';

declare module 'expo-router' {
  export type Href = string;
  export const router: {
    push: (href: Href) => void;
    replace: (href: Href) => void;
    back: () => void;
  };
  export const Link: React.ComponentType<{
    href: Href;
    children?: React.ReactNode;
    target?: string;
    onPress?: (event: any) => any;
    dismissTo?: boolean;
    style?: any;
  }>;
  export const useRouter: () => {
    push: (href: Href) => void;
    replace: (href: Href) => void;
    back: () => void;
  };
}
