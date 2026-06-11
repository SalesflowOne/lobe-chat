'use client';

import { Button, Form, Input, Typography } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AuthCard from '@/components/Auth/AuthCard';
import { agentOpsEnv } from '@/config/agentops';
import { signIn } from '@/libs/auth';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const productName = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME;
  const redirectTo = searchParams.get('redirect') || '/chat';

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(values.email, values.password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    await fetch('/api/auth/sync-user', { method: 'POST' });
    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <AuthCard subtitle={`Sign in to ${productName}`} title="Welcome back">
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ message: 'Enter your email', required: true, type: 'email' }]}
        >
          <Input autoComplete="email" placeholder="you@company.com" size="large" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ message: 'Enter your password', required: true }]}
        >
          <Input.Password autoComplete="current-password" placeholder="••••••••" size="large" />
        </Form.Item>
        {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
        <Flexbox gap={12} style={{ marginTop: 16 }}>
          <Button block htmlType="submit" loading={loading} size="large" type="primary">
            Sign in
          </Button>
          <Flexbox horizontal justify="space-between">
            <Link href="/forgot-password">Forgot password?</Link>
            <Link href="/signup">Create account</Link>
          </Flexbox>
        </Flexbox>
      </Form>
    </AuthCard>
  );
};

export default LoginForm;
