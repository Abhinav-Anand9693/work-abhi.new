export type ToolType =
  | "calculator"
  | "text"
  | "file-data"
  | "image"
  | "pdf"
  | "color"
  | "developer"
  | "qr"
  | "code"
  | "generator"
  | "audio"
  | "video"
  | "security"
  | "date-time";

export type ToolCategory =
  | "calculator"
  | "image"
  | "pdf"
  | "text"
  | "developer"
  | "qr"
  | "security"
  | "color"
  | "date-time"
  | "file-data"
  | "audio"
  | "video";

export type CalculatorEngine =
  | "financial"
  | "investment"
  | "deposit"
  | "tax"
  | "basic"
  | "date"
  | "health"
  | "education";

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolSEO {
  title: string;
  description: string;
  keywords?: string[];
  intro?: string;
  howToUse?: string[];
  faq?: ToolFAQ[];
  features?: string[];
  supportedFormats?: {
    input: string[];
    output: string[];
  };
  limitations?: string;
  technicalSpecs?: string;
  privacyNote?: string;
  useCases?: string[];
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string;
  type: ToolType;
  engine?: string;
  available: boolean;
  popular?: boolean;
  seo: ToolSEO;
}