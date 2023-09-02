export type CameraNamingScheme = {
    type: 'datetime';
    prefix: string;
} | {
    type: 'sequence';
    prefix: string;
    sequence: string;
} | {
    type: 'datetime & sequence';
    prefix: string;
    sequence: string;
};

export type CameraQuality = 'low' | 'medium' | 'high'

export type FlashMode = "auto" | "on" | "off" | "torch";

  