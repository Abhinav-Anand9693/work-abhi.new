declare module "jsqr" {
  export interface QRCode {
    binaryData: number[];
    data: string;
    location: {
      topRightCorner: { x: number; y: number };
      topLeftCorner: { x: number; y: number };
      bottomRightCorner: { x: number; y: number };
      bottomLeftCorner: { x: number; y: number };
    };
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" | "invertFirst" }
  ): QRCode | null;
}

declare module "next" {
  export type Metadata = Record<string, any>;
}

declare module "streamsaver" {
  const streamSaver: {
    createWriteStream: (filename: string, options?: any) => WritableStream<Uint8Array>;
  };
  export default streamSaver;
}

declare module "prettier/standalone" {
  export function format(source: string, options?: any): Promise<string>;
}

declare module "prettier/plugins/babel" {
  const plugin: any;
  export default plugin;
}

declare module "prettier/plugins/estree" {
  const plugin: any;
  export default plugin;
}

declare module "prettier/plugins/html" {
  const plugin: any;
  export default plugin;
}

declare module "prettier/plugins/postcss" {
  const plugin: any;
  export default plugin;
}

declare module "prettier/plugins/typescript" {
  const plugin: any;
  export default plugin;
}

declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export const getDocument: any;
  export const GlobalWorkerOptions: any;
}

