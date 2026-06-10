'use client';

import { Icon } from '@lobehub/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Empty, Input, Spin, Tag, Typography } from 'antd';
import { Plug, Search, Star } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import type { IntegrationApp } from '@/server/pipedream/apps';

interface IntegrationsResponse {
  apps: IntegrationApp[];
  configured: boolean;
  message?: string;
  total: number;
}

interface AccountsResponse {
  accounts: Array<{ appSlug: string; healthy?: boolean; id: string }>;
}

const fetchApps = async (q: string): Promise<IntegrationsResponse> => {
  const params = q ? `?q=${encodeURIComponent(q)}` : '';
  const res = await fetch(`/api/integrations/apps${params}`);
  if (!res.ok) throw new Error('Failed to load integrations');
  return res.json();
};

const fetchAccounts = async (): Promise<AccountsResponse> => {
  const res = await fetch('/api/integrations/accounts');
  if (!res.ok) throw new Error('Failed to load connected accounts');
  return res.json();
};

const connectApp = async (appSlug: string) => {
  const res = await fetch('/api/integrations/connect', {
    body: JSON.stringify({ appSlug }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to start connection');
  return res.json() as Promise<{ connectLink: string }>;
};

const IntegrationCard = memo<{
  app: IntegrationApp;
  connected: boolean;
  connecting: boolean;
  onConnect: (slug: string) => void;
}>(({ app, connected, connecting, onConnect }) => (
  <Card
    hoverable
    size="small"
    style={{ height: '100%' }}
    title={
      <Flexbox align="center" gap={8} horizontal>
        {app.imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={app.name} height={20} src={app.imgSrc} width={20} />
        ) : (
          <Icon icon={Plug} />
        )}
        <span>{app.name}</span>
        {app.isFeatured && <Icon icon={Star} />}
      </Flexbox>
    }
  >
    <Flexbox gap={12}>
      <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0, minHeight: 44 }}>
        {app.description || 'Connect this app to your AgentOps workspace.'}
      </Typography.Paragraph>
      <Flexbox align="center" gap={8} horizontal justify="space-between">
        <Tag color={connected ? 'success' : 'default'}>
          {connected ? 'Connected' : 'Not connected'}
        </Tag>
        <Button
          disabled={connected}
          loading={connecting}
          onClick={() => onConnect(app.nameSlug)}
          size="small"
          type={connected ? 'default' : 'primary'}
        >
          {connected ? 'Connected' : 'Connect'}
        </Button>
      </Flexbox>
    </Flexbox>
  </Card>
));

IntegrationCard.displayName = 'IntegrationCard';

const IntegrationsCatalog = memo(() => {
  const [query, setQuery] = useState('');
  const [connectingSlug, setConnectingSlug] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryFn: () => fetchApps(query),
    queryKey: ['integrations', 'apps', query],
  });

  const { data: accountsData } = useQuery({
    queryFn: fetchAccounts,
    queryKey: ['integrations', 'accounts'],
  });

  const connectMutation = useMutation({
    mutationFn: connectApp,
    onSettled: () => {
      setConnectingSlug(null);
      queryClient.invalidateQueries({ queryKey: ['integrations', 'accounts'] });
    },
    onSuccess: ({ connectLink }) => {
      window.open(connectLink, '_blank', 'noopener,noreferrer,width=520,height=720');
    },
  });

  const connectedSlugs = useMemo(
    () => new Set(accountsData?.accounts.map((a) => a.appSlug) ?? []),
    [accountsData],
  );

  const featuredApps = useMemo(
    () => appsData?.apps.filter((app) => app.isFeatured) ?? [],
    [appsData],
  );

  const otherApps = useMemo(
    () => appsData?.apps.filter((app) => !app.isFeatured) ?? [],
    [appsData],
  );

  const handleConnect = (slug: string) => {
    setConnectingSlug(slug);
    connectMutation.mutate(slug);
  };

  if (appsLoading) {
    return (
      <Center padding={48}>
        <Spin size="large" />
      </Center>
    );
  }

  if (!appsData?.configured) {
    return (
      <Empty
        description={appsData?.message ?? 'Pipedream is not configured for this deployment.'}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Flexbox gap={24} padding={24} style={{ maxWidth: 1200, width: '100%' }}>
      <Flexbox gap={8}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Integrations
        </Typography.Title>
        <Typography.Text type="secondary">
          Connect your business apps via Pipedream. {appsData.total.toLocaleString()} connectors
          available.
        </Typography.Text>
      </Flexbox>

      <Input
        allowClear
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search connectors (Slack, Gmail, Notion…)"
        prefix={<Icon icon={Search} />}
        size="large"
        value={query}
      />

      {featuredApps.length > 0 && !query && (
        <Flexbox gap={12}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Popular
          </Typography.Title>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            }}
          >
            {featuredApps.map((app) => (
              <IntegrationCard
                app={app}
                connected={connectedSlugs.has(app.nameSlug)}
                connecting={connectingSlug === app.nameSlug}
                key={app.nameSlug}
                onConnect={handleConnect}
              />
            ))}
          </div>
        </Flexbox>
      )}

      <Flexbox gap={12}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {query ? 'Search results' : 'All connectors'}
        </Typography.Title>
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {(query ? appsData.apps : otherApps).map((app) => (
            <IntegrationCard
              app={app}
              connected={connectedSlugs.has(app.nameSlug)}
              connecting={connectingSlug === app.nameSlug}
              key={app.nameSlug}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </Flexbox>
    </Flexbox>
  );
});

IntegrationsCatalog.displayName = 'IntegrationsCatalog';

export default IntegrationsCatalog;
