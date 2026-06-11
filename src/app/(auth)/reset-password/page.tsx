'use client';

import { Button, Form, Input, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AuthCard from '@/components/Auth/AuthCard';
import { updatePassword } from '@/libs/auth';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { password: string }) => {
    setLoading(true);
    setError(null);

    const { error: authError } = await updatePassword(values.password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.replace('/login');
    router.refresh();
  };

  return (
    <AuthCard subtitle="Choose a new password for your account" title="Set a new password">
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          label="New password"
          name="password"
          rules={[{ message: 'Enter a password (min 8 characters)', min: 8, required: true }]}
        >
          <Input.Password autoComplete="new-password" placeholder="••••••••" size="large" />
        </Form.Item>
        {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
        <Flexbox gap={12} style={{ marginTop: 16 }}>
          <Button block htmlType="submit" loading={loading} size="large" type="primary">
            Update password
          </Button>
          <Link href="/login">Back to sign in</Link>
        </Flexbox>
      </Form>
    </AuthCard>
  );
};

export default ResetPasswordPage;
