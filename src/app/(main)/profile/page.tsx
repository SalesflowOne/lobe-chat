'use client';

import { Button, Form, Input, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AuthCard from '@/components/Auth/AuthCard';
import { useAuth } from '@/hooks/useAuth';
import { lambdaClient } from '@/libs/trpc/client';

const ProfilePage = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn, signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/login?redirect=/profile');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.latestName,
      username: user.username,
    });
  }, [form, user]);

  const onFinish = async (values: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }) => {
    setLoading(true);
    setMessage(null);

    try {
      await lambdaClient.user.updateProfile.mutate({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
      });
      setMessage('Profile updated.');
    } catch {
      setMessage('Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  return (
    <Flexbox height="100%" padding={24} width="100%">
      <AuthCard subtitle="Manage your account details" title="Profile">
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item label="Email" name="email">
            <Input disabled size="large" />
          </Form.Item>
          <Form.Item label="Username" name="username">
            <Input size="large" />
          </Form.Item>
          <Form.Item label="First name" name="firstName">
            <Input size="large" />
          </Form.Item>
          <Form.Item label="Last name" name="lastName">
            <Input size="large" />
          </Form.Item>
          {message ? <Typography.Text>{message}</Typography.Text> : null}
          <Flexbox gap={12} style={{ marginTop: 16 }}>
            <Button block htmlType="submit" loading={loading} size="large" type="primary">
              Save changes
            </Button>
            <Button
              block
              danger
              onClick={async () => {
                await signOut();
                router.replace('/login');
              }}
              size="large"
            >
              Sign out
            </Button>
          </Flexbox>
        </Form>
      </AuthCard>
    </Flexbox>
  );
};

export default ProfilePage;
