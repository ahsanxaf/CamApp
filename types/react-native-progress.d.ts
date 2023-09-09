declare module 'react-native-progress' {
    import { Component } from 'react';
    
    // Add declarations for the components you're using, e.g., ProgressBar, like this:
    export class ProgressBar extends Component<{
      progress: number;
      width?: number;
      height?: number;
      color?: string;
      // Add other props as needed
    }> {}
  }
  