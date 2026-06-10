import { Suspense } from 'react';

import IntegrationsCatalog from '@/features/integrations/IntegrationsCatalog';
import { metadataModule } from '@/server/metadata';

export const generateMetadata = async () => {
  return metadataModule.generate({
    description: 'Connect your business apps to AgentOps via Pipedream MCP.',
    title: 'Connectors',
    url: '/integrations',
  });
};

const IntegrationsPage = () => {
  return (
    <Suspense fallback={null}>
      <IntegrationsCatalog />
    </Suspense>
  );
};

export default IntegrationsPage;
