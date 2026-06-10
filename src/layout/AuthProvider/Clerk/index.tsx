'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { PropsWithChildren, memo, useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { clerkSatelliteEnv, getClerkProviderAuthUrls, isClerkSatelliteReady } from '@/config/clerk';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import UserUpdater from './UserUpdater';
import { useAppearance } from './useAppearance';

const Clerk = memo(({ children }: PropsWithChildren) => {
  const { enableClerkSignUp } = useServerConfigStore(featureFlagsSelectors);
  const appearance = useAppearance();
  const {
    i18n: { language, getResourceBundle },
  } = useTranslation('clerk');

  const localization = useMemo(() => getResourceBundle(language, 'clerk'), [language]);

  // When useAppearance returns different result during SSR vs. client-side (when theme mode is auto), the appearance is not applied
  // It's because Clerk internally re-applies SSR props after transition which overrides client-side props, see https://github.com/clerk/javascript/blob/main/packages/nextjs/src/app-router/client/ClerkProvider.tsx
  // This re-renders the provider after transition to make sure client-side props are always applied
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (count || isPending) return;
    startTransition(() => {
      setCount((count) => count + 1);
    });
  }, [count, setCount, isPending, startTransition]);

  const updatedAppearance = useMemo(
    () => ({
      ...appearance,
      elements: {
        ...appearance.elements,
        ...(!enableClerkSignUp ? { footerAction: { display: 'none' } } : {}),
      },
    }),
    [appearance, enableClerkSignUp],
  );

  const authUrls = getClerkProviderAuthUrls();
  const signUpUrl = !enableClerkSignUp ? authUrls.signInUrl : authUrls.signUpUrl;
  const satelliteOnly = isClerkSatelliteReady()
    ? {
        domain: clerkSatelliteEnv.NEXT_PUBLIC_CLERK_DOMAIN!,
        isSatellite: true as const,
      }
    : {};

  return (
    <ClerkProvider
      afterSignInUrl="/chat"
      afterSignUpUrl="/onboard"
      appearance={updatedAppearance}
      localization={localization}
      signInUrl={authUrls.signInUrl}
      signUpUrl={signUpUrl}
      {...satelliteOnly}
    >
      {children}
      <UserUpdater />
    </ClerkProvider>
  );
});

export default Clerk;
