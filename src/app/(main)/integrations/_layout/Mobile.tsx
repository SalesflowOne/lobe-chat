'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LayoutProps } from './type';

const Layout = memo<LayoutProps>(({ children }) => {
  return (
    <Flexbox height="100%" style={{ overflow: 'auto' }} width="100%">
      {children}
    </Flexbox>
  );
});

Layout.displayName = 'IntegrationsMobileLayout';

export default Layout;
