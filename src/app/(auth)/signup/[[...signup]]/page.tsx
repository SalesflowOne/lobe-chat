import { SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { agentOpsEnv } from '@/config/agentops';
import { serverFeatureFlags } from '@/config/featureFlags';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('clerk');
  const productName = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME;

  return metadataModule.generate({
    description: t('signUp.start.subtitle'),
    title: t('signUp.start.title', { applicationName: productName }),
    url: '/signup',
  });
};

const Page = () => {
  const enableClerkSignUp = serverFeatureFlags().enableClerkSignUp;

  if (!enableClerkSignUp) {
    redirect('/login');
  }

  return (
    <SignUp
      fallbackRedirectUrl="/onboard"
      forceRedirectUrl="/onboard"
      path="/signup"
      routing="path"
      signInUrl="/login"
    />
  );
};

Page.displayName = 'Signup';

export default Page;
