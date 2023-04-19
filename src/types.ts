import type { SessionData, SessionStorage } from "@remix-run/node";
import { ZodSchema } from "zod";

export type WizardRegisterResponse = {
  parseFormValue: (key: string) => Promise<void>;
  parseFormWithSchema: () => void;
  nextStep: () => Response;
  getFormData: () => Record<string, string>;
  getFormValue: (name: string) => Promise<string>;
  prevStep: () => Response;
  jumpToStep: (jumpTo: number | string) => Response;
};

export type WizardConfig = {
  name: string;
  routes: string[];
  schema?: ZodSchema;
  storage?: SessionStorage<SessionData, SessionData>;
};
export type WizardRegisterFunction = (
  request: Request
) => Promise<WizardRegisterResponse>;
