declare module 'react-native-svg-charts' {
  import { ViewStyle } from 'react-native';

  export interface LineChartProps {
    data: number[];
    width: number;
    height: number;
    svg?: {
      stroke?: string;
      strokeWidth?: number;
      fill?: string;
      strokeOpacity?: number;
      fillOpacity?: number;
    };
    contentInset?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    style?: ViewStyle;
    yMin?: number;
    yMax?: number;
    children?: React.ReactNode;
  }

  export const LineChart: React.FC<LineChartProps>;
}
