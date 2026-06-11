'use client';

import { createStyles } from 'antd-style';
import { Typography } from 'antd';
import { PropsWithChildren } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { agentOpsEnv } from '@/config/agentops';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    width: 100%;
    max-width: 420px;
    padding: 32px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};
  `,
  subtitle: css`
    margin-block-end: 24px;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    margin-block-end: 8px;
  `,
}));

interface AuthCardProps extends PropsWithChildren {
  subtitle?: string;
  title: string;
}

const AuthCard = ({ children, subtitle, title }: AuthCardProps) => {
  const { styles } = useStyles();
  const productName = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME;

  return (
    <Center height="100%" width="100%">
      <Flexbox className={styles.card} gap={8}>
        <Typography.Title className={styles.title} level={3}>
          {title}
        </Typography.Title>
        {subtitle ? (
          <Typography.Text className={styles.subtitle} type="secondary">
            {subtitle}
          </Typography.Text>
        ) : (
          <Typography.Text className={styles.subtitle} type="secondary">
            {productName}
          </Typography.Text>
        )}
        {children}
      </Flexbox>
    </Center>
  );
};

export default AuthCard;
