'use client';

import { Button, Form, Input, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AuthCard from '@/components/Auth/AuthCard';
import { agentOpsEnv } from '@/config/agentops';
import { signUp } from '@/libs/auth';

const SignupPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const productName = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME;

  const onFinish = async (values: {
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: authError } = await signUp(values.email, values.password, {
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await fetch('/api/auth/sync-user', { method: 'POST' });
      router.replace('/onboard');
      router.refresh();
      return;
    }

    setMessage('Check your email to confirm your account, then sign in.');
    setLoading(false);
  };

  return (
    <AuthCard subtitle={`Create your ${productName} account`} title="Get started">
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item label="First name" name="firstName">
          <Input autoComplete="given-name" placeholder="First name" size="large" />
        </Form.Item>
        <Form.Item label="Last name" name="lastName">
          <Input autoComplete="family-name" placeholder="Last name" size="large" />
        </Form.Item>
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
          rules={[{ message: 'Choose a password (min 8 characters)', min: 8, required: true }]}
        >
          <Input.Password autoComplete="new-password" placeholder="••••••••" size="large" />
        </Form.Item>
        {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
        {message ? <Typography.Text type="success">{message}</Typography.Text> : null}
        <Flexbox gap={12} style={{ marginTop: 16 }}>
          <Button block htmlType="submit" loading={loading} size="large" type="primary">
            Create account
          </Button>
          <Link href="/login">Already have an account? Sign in</Link>
        </Flexbox>
      </Form>
    </AuthCard>
  );
};

export default SignupPage;
