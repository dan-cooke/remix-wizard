import type { Session, SessionData, SessionStorage } from "@remix-run/node";
import { ZodSchema } from "zod";

export type WizardRegisterResponse = {
  data: SessionData;
  save: (key: string, data: any) => void;
  nextStep: () => Response;
  prevStep: () => Response;
  jumpToStep: (jumpTo: number | string) => Response;
};

export type WizardConfig = {
  name: string;
  routes: string[];
  storage?: SessionStorage<SessionData, SessionData>;
};

export type WizardRegisterFunction = (
  request: Request
) => Promise<WizardRegisterResponse>;
