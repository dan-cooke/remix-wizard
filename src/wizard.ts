import { createCookieSessionStorage, redirect } from "@remix-run/node";
import {
  WizardConfig,
  WizardRegisterFunction,
  WizardRegisterResponse,
} from "./types";

/**
 * The wizard class - use this to define a re-usable wizard
 * that you can then import in your action functions
 * 
 *@example

 import { Wizard } from "remix-wizard"
 const addPatientWizard = new Wizard("add-patient-wizard", [
  "/patients/add/step-1",
  "/patients/add/step-2",
  "/patients/add/step-3",
 ]);
 */
export class Wizard {
  private config: WizardConfig;

  constructor(config: WizardConfig) {
    this.config = config;

    if (!this.config.storage) {
      this.config.storage = createCookieSessionStorage({
        cookie: {
          name: config.name,
          sameSite: "lax",
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // enable this in prod only
        },
      });
    }
  }

  private getStepFromUrl(url: string): number {
    return this.config.routes.findIndex((stepUrl) => url.includes(stepUrl));
  }

  /**
   *
   * Register a wizard step with the action function
   * @param request - the request object
   * @returns
   */
  public register: WizardRegisterFunction = async (
    request: Request
  ): Promise<WizardRegisterResponse> => {
    const formData = await request.formData();
    const cookie = request.headers.get("cookie");
    const session = await this.config.storage.getSession(cookie);
    const headers = new Headers();

    return {
      parseFormWithSchema: async () => {
        if (!this.config.schema) {
          throw new Error("No schema defined for this wizard");
        }
        const data = this.config.schema.parse(formData);
        console.log(data);
      },
      /**
       * Parse and store an individual form value,
       * @param name - the name of the form input to parse
       * @example
       * // your form
       * <input name="name" />
       * <input name="address" />
       *
       * // your action
       * parseFormValue("name")
       * parseFormValue("address")
       */
      parseFormValue: async (name: string) => {
        let entry = formData.getAll(name);
        let value;

        if (value.length === 0) {
          value = value[0].toString();
        } else {
          value = entry;
        }

        session.set(name, value);
        headers.append(
          "Set-Cookie",
          await this.config.storage.commitSession(session)
        );
      },

      /**
       *
       * Get the value of a single form input that has been stored
       * in the wizard
       * @param name - the name of the form input to get
       */
      getFormValue: async (name: string) => {
        return session.get(name) as string;
      },

      /**
       *
       * @returns
       */
      getFormData: () => {
        return session.data as Record<string, string>;
      },

      /**
       * Go to the next step in the wizard
       * @returns
       */
      nextStep: () => {
        const step = this.getStepFromUrl(request.url);
        return redirect(this.config.routes[step + 1], {
          headers,
        });
      },
      /**
       * Go to the previous step in the wizard
       * @returns
       */
      prevStep: () => {
        const step = this.getStepFromUrl(request.url);
        return redirect(this.config.routes[step - 1], {
          headers,
        });
      },
      /**
       * Jump to a step in the wizard
       * @param jumpTo - either a number or a string that contains the url of the step to jump to
       * @returns
       */
      jumpToStep: (jumpTo) => {
        let step = jumpTo;
        if (typeof jumpTo === "string") {
          step = this.getStepFromUrl(jumpTo);
        }
        return redirect(this.config.routes[step], {
          headers,
        });
      },
    };
  };
}
