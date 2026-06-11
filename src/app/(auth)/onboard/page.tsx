'use client';

import { Button, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AuthCard from '@/components/Auth/AuthCard';
import { agentOpsEnv } from '@/config/agentops';
import { lambdaClient } from '@/libs/trpc/client';

const OnboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const productName = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME;

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      await lambdaClient.user.makeUserOnboarded.mutate();
      router.replace('/integrations');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle={`Set up ${productName} in a few steps`} title="Welcome aboard">
      <Flexbox gap={16}>
        <Typography.Paragraph>
          Connect your tools, configure agents, and start automating work from one workspace.
        </Typography.Paragraph>
        <Button block loading={loading} onClick={finishOnboarding} size="large" type="primary">
          Continue to integrations
        </Button>
        <Button block onClick={() => router.replace('/chat')} size="large" type="default">
          Skip for now
        </Button>
      </Flexbox>
    </AuthCard>
  );
};

export default OnboardPage;
