'use client';

import { OrganizationSwitcher as ClerkOrganizationSwitcher } from '@clerk/nextjs';
import { memo } from 'react';

/**
 * Multi-tenant workspace switcher. Connections and MCP context are scoped
 * to the active Clerk organization when one is selected.
 */
const OrganizationSwitcher = memo(() => {
  return (
    <ClerkOrganizationSwitcher
      afterCreateOrganizationUrl="/integrations"
      afterLeaveOrganizationUrl="/integrations"
      afterSelectOrganizationUrl="/integrations"
      appearance={{
        elements: {
          rootBox: { display: 'flex', justifyContent: 'flex-end' },
        },
      }}
      hidePersonal={false}
    />
  );
});

OrganizationSwitcher.displayName = 'OrganizationSwitcher';

export default OrganizationSwitcher;
