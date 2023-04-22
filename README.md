# remix-wizard 🧙‍♂️

A all-in-one solution for building [wizards](<https://en.wikipedia.org/wiki/Wizard_(software)>) in [remix.run](https://remix.run)

## Installation

```
yarn add remix-wizard
```

## Examples
### Basic

1. Create a wizard and specify your `routes`

**oboarding.server.ts**
```.ts
export const onboardingWizard = createWizard({
  name: 'onboarding-wizard',
  routes: [
	'/onboarding/org',
	'/onboarding/users',
	'/onboarding/finish'
  ],
});

```

2. Import your wizard and call `register` in your action

**routes/onboarding/users.tsx**

```.ts
import { onboardingWizard } from './onboarding.server'

export const action = ({ request }) => {
    const { save, nextStep, jumpToStep, prevStep } =
      await onboardingWizard.register(request);

    // Save arbitary data to the wizard session
    save('userProfile', { name: 'John Doe' });

    // Jump to a specific step
    if (request.url.searchParams.get('skip')){
      // You can do it by string
      return jumpToStep("/onboarding/finish");

      // Or by index
      // return jumpToStep(3);
    }

    // Go to the next step
    return nextStep();

}
```

3. Call `register` in your loader to access previously stored data

```.ts
export const loader = async ({ request }) => {
    const { data } = await onboardingWizard.register(request);

    return data?.['userProfile'] || {};
};

```

### Use custom `SessionStorage`
By default `remix-wizard` will use `createCookieSessionStorage` if you do not pass a `storage` paramter to the `createWizard` function. 

But you can also use any other `SessionStorage` you wish.

```.ts
export const onboardingWizard = createWizard({
  name: 'onboarding-wizard',
  routes: ['/onboarding/org', '/onboarding/users'],
  storage: createMemorySessionStorage({
    cookie: {
      name: 'onboarding-wizard',
      httpOnly: true,
    },
  }),
});

```
