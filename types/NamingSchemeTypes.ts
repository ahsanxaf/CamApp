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
  