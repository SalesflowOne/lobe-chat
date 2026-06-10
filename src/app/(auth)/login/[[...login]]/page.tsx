import { SignIn } from '@clerk/nextjs';

import { agentOpsEnv } from '@/config/agentops';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('clerk');
  const productName = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME;

  return metadataModule.generate({
    description: t('signIn.start.subtitle'),
    title: t('signIn.start.title', { applicationName: productName }),
    url: '/login',
  });
};

const Page = () => {
  return (
    <SignIn
      fallbackRedirectUrl="/chat"
      forceRedirectUrl="/chat"
      path="/login"
      routing="path"
      signUpUrl="/signup"
    />
  );
};

Page.displayName = 'Login';

export default Page;
