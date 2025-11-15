declare module '@capacitor/core' {
  export const Capacitor: {
    isNativePlatform(): boolean;
    getPlatform(): string;
    isPluginAvailable(pluginName: string): boolean;
  };
}

declare module '@capacitor/haptics' {
  export enum ImpactStyle {
    Heavy = 'HEAVY',
    Medium = 'MEDIUM',
    Light = 'LIGHT',
  }

  export enum NotificationType {
    Success = 'SUCCESS',
    Warning = 'WARNING',
    Error = 'ERROR',
  }

  export const Haptics: {
    impact(options: { style: ImpactStyle }): Promise<void>;
    notification(options: { type: NotificationType }): Promise<void>;
    vibrate(): Promise<void>;
    selectionStart(): Promise<void>;
    selectionChanged(): Promise<void>;
    selectionEnd(): Promise<void>;
  };
}

declare module '@capacitor/status-bar' {
  export enum Style {
    Dark = 'Dark',
    Light = 'Light',
    Default = 'Default',
  }

  export const StatusBar: {
    setStyle(options: { style: Style }): Promise<void>;
    setBackgroundColor(options: { color: string }): Promise<void>;
    hide(): Promise<void>;
    show(): Promise<void>;
  };
}

declare module '@capacitor/splash-screen' {
  export const SplashScreen: {
    show(): Promise<void>;
    hide(): Promise<void>;
  };
}

declare module '@capacitor/cli' {
  export interface CapacitorConfig {
    appId: string;
    appName: string;
    webDir: string;
    server?: Record<string, unknown>;
    android?: Record<string, unknown>;
    ios?: Record<string, unknown>;
    plugins?: Record<string, unknown>;
  }
}
