import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { WizardConfig } from "./types";

export const createWizard = (config: WizardConfig) => {
  let { routes, name, storage } = config;

  if (!storage) {
    storage = createCookieSessionStorage({
      cookie: {
        name,
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    });
  }

  const getStepFromUrl = (url: string): number => {
    return routes.findIndex((stepUrl) => url.includes(stepUrl));
  };

  return {
    register: async (request: Request) => {
      const cookie = request.headers.get("cookie");
      const session = await config.storage.getSession(cookie);
      const data = session.data || {};

      return {
        data,
        save: (key: string, data: any) => {
          session.set(key, data);
        },

        /**
         * Go to the next step in the wizard
         * @returns
         */
        async nextStep() {
          const headers = new Headers();
          headers.append("Set-Cookie", await storage.commitSession(session));
          const step = getStepFromUrl(request.url);

          return redirect(routes[step + 1], {
            headers,
          });
        },
        /**
         * Go to the previous step in the wizard
         * @returns
         */
        async prevStep() {
          const headers = new Headers();
          headers.append("Set-Cookie", await storage.commitSession(session));
          const step = getStepFromUrl(request.url);
          return redirect(routes[step - 1], {
            headers,
          });
        },
        /**
         * Jump to a step in the wizard
         * @param jumpTo - either a number or a string that contains the url of the step to jump to
         * @returns
         */
        async jumpToStep(jumpTo: string | number) {
          const headers = new Headers();
          headers.append("Set-Cookie", await storage.commitSession(session));
          let step = jumpTo;
          if (typeof jumpTo === "string") {
            step = getStepFromUrl(jumpTo);
          }
          return redirect(routes[step], {
            headers,
          });
        },
      };
    },
  };
};
