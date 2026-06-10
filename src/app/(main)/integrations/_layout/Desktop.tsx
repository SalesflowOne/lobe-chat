'use client';

import { ChatHeader } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Plug } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import OrganizationSwitcher from '@/features/operator/OrganizationSwitcher';

import { LayoutProps } from './type';

const useStyles = createStyles(({ css, token }) => ({
  title: css`
    font-size: 16px;
    font-weight: 600;
    color: ${token.colorText};
  `,
}));

const Layout = memo<LayoutProps>(({ children }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');

  return (
    <Flexbox height="100%" style={{ overflow: 'hidden', position: 'relative' }} width="100%">
      <ChatHeader
        left={
          <Flexbox align="center" gap={8} horizontal>
            <Plug size={20} />
            <span className={styles.title}>{t('tab.integrations')}</span>
          </Flexbox>
        }
        right={<OrganizationSwitcher />}
      />
      <Flexbox flex={1} style={{ overflow: 'auto' }} width="100%">
        {children}
      </Flexbox>
    </Flexbox>
  );
});

Layout.displayName = 'IntegrationsDesktopLayout';

export default Layout;
