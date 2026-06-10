import { Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import IntegrationsCatalog from '@/features/integrations/IntegrationsCatalog';
import OrganizationSwitcher from '@/features/operator/OrganizationSwitcher';
import { metadataModule } from '@/server/metadata';

export const generateMetadata = async () => {
  return metadataModule.generate({
    description: 'Connect your business apps to AgentOps via Pipedream MCP.',
    title: 'Integrations',
    url: '/integrations',
  });
};

const IntegrationsPage = () => {
  return (
    <Flexbox height="100%" width="100%">
      <Flexbox
        align="flex-end"
        padding={16}
        style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
      >
        <OrganizationSwitcher />
      </Flexbox>
      <Suspense fallback={null}>
        <IntegrationsCatalog />
      </Suspense>
    </Flexbox>
  );
};

export default IntegrationsPage;
