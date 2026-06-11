'use client';

import { Button, Form, Input, Typography } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AuthCard from '@/components/Auth/AuthCard';
import { getAgentOpsAuthUrls } from '@/config/auth-paths';
import { resetPassword } from '@/libs/auth';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: authError } = await resetPassword(
      values.email,
      `${getAgentOpsAuthUrls().resetPasswordUrl}`,
    );

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setMessage('If an account exists for that email, a reset link has been sent.');
    setLoading(false);
  };

  return (
    <AuthCard subtitle="We'll email you a reset link" title="Reset your password">
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ message: 'Enter your email', required: true, type: 'email' }]}
        >
          <Input autoComplete="email" placeholder="you@company.com" size="large" />
        </Form.Item>
        {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
        {message ? <Typography.Text type="success">{message}</Typography.Text> : null}
        <Flexbox gap={12} style={{ marginTop: 16 }}>
          <Button block htmlType="submit" loading={loading} size="large" type="primary">
            Send reset link
          </Button>
          <Link href="/login">Back to sign in</Link>
        </Flexbox>
      </Form>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
