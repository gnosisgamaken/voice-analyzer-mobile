declare module '@react-native-community/blur' {
  import { Component } from 'react';
  import { ViewProps, ColorValue } from 'react-native';

  export interface BlurViewProps extends ViewProps {
    blurType?: 'xlight' | 'light' | 'dark' | 'extraDark' | 'regular' | 'default';
    blurAmount?: number;
    reducedTransparencyFallbackColor?: ColorValue;
  }

  export class BlurView extends Component<BlurViewProps> {}
}
