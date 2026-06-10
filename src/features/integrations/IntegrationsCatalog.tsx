'use client';

import { Icon } from '@lobehub/ui';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Empty, Input, Spin, Tag, Typography, message } from 'antd';
import { Plug, Search, Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { memo, useEffect, useMemo, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import type { IntegrationApp } from '@/server/pipedream/apps';

interface IntegrationsResponse {
  apps: IntegrationApp[];
  configured: boolean;
  featured?: boolean;
  message?: string;
  pageInfo?: {
    endCursor: string | null;
    hasMore: boolean;
    totalCount?: number;
  };
  total: number;
}

interface AccountsResponse {
  accounts: Array<{ appSlug: string; healthy?: boolean; id: string }>;
}

const fetchFeaturedApps = async (): Promise<IntegrationsResponse> => {
  const res = await fetch('/api/integrations/apps?featured=true');
  if (!res.ok) throw new Error('Failed to load featured integrations');
  return res.json();
};

const fetchAppsPage = async ({
  pageParam,
  queryKey,
}: {
  pageParam?: string;
  queryKey: readonly unknown[];
}): Promise<IntegrationsResponse> => {
  const q = String(queryKey[2] ?? '');
  const params = new URLSearchParams({ limit: '48' });
  if (q) params.set('q', q);
  if (pageParam) params.set('after', pageParam);

  const res = await fetch(`/api/integrations/apps?${params}`);
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
          <img alt={app.name} height={20} loading="lazy" src={app.imgSrc} width={20} />
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

const IntegrationsGrid = memo<{
  apps: IntegrationApp[];
  connectedSlugs: Set<string>;
  connectingSlug: string | null;
  onConnect: (slug: string) => void;
}>(({ apps, connectedSlugs, connectingSlug, onConnect }) => (
  <div
    style={{
      display: 'grid',
      gap: 12,
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    }}
  >
    {apps.map((app) => (
      <IntegrationCard
        app={app}
        connected={connectedSlugs.has(app.nameSlug)}
        connecting={connectingSlug === app.nameSlug}
        key={app.nameSlug}
        onConnect={onConnect}
      />
    ))}
  </div>
));

IntegrationsGrid.displayName = 'IntegrationsGrid';

const IntegrationsCatalog = memo(() => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [connectingSlug, setConnectingSlug] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      message.success(`Successfully connected ${connected}`);
      queryClient.invalidateQueries({ queryKey: ['integrations', 'accounts'] });
    }
  }, [queryClient, searchParams]);

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    enabled: !debouncedQuery,
    queryFn: fetchFeaturedApps,
    queryKey: ['integrations', 'featured'],
    staleTime: 60 * 60 * 1000,
  });

  const {
    data: pagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: pagesLoading,
  } = useInfiniteQuery({
    enabled: Boolean(debouncedQuery) || featuredData !== undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo?.hasMore ? lastPage.pageInfo.endCursor : undefined,
    initialPageParam: undefined as string | undefined,
    queryFn: fetchAppsPage,
    queryKey: ['integrations', 'apps', debouncedQuery],
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

  const allApps = useMemo(() => pagesData?.pages.flatMap((page) => page.apps) ?? [], [pagesData]);

  const handleConnect = (slug: string) => {
    setConnectingSlug(slug);
    connectMutation.mutate(slug);
  };

  const isLoading = featuredLoading || (pagesLoading && !pagesData);

  if (isLoading) {
    return (
      <Center padding={48}>
        <Spin size="large" />
      </Center>
    );
  }

  const configured = featuredData?.configured ?? pagesData?.pages[0]?.configured ?? false;

  if (!configured) {
    return (
      <Empty
        description={
          featuredData?.message ??
          pagesData?.pages[0]?.message ??
          'Pipedream is not configured for this deployment.'
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const totalCount =
    pagesData?.pages[0]?.pageInfo?.totalCount ?? pagesData?.pages[0]?.total ?? allApps.length;

  return (
    <Flexbox gap={24} padding={24} style={{ maxWidth: 1200, width: '100%' }}>
      <Flexbox gap={8}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Integrations
        </Typography.Title>
        <Typography.Text type="secondary">
          Connect your business apps via Pipedream.
          {totalCount > 0 && ` ${totalCount.toLocaleString()}+ connectors available.`}
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

      {!debouncedQuery && featuredData?.apps.length ? (
        <Flexbox gap={12}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Popular
          </Typography.Title>
          <IntegrationsGrid
            apps={featuredData.apps}
            connectedSlugs={connectedSlugs}
            connectingSlug={connectingSlug}
            onConnect={handleConnect}
          />
        </Flexbox>
      ) : null}

      <Flexbox gap={12}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {debouncedQuery ? 'Search results' : 'All connectors'}
        </Typography.Title>
        <IntegrationsGrid
          apps={allApps}
          connectedSlugs={connectedSlugs}
          connectingSlug={connectingSlug}
          onConnect={handleConnect}
        />
        {hasNextPage && (
          <Center>
            <Button loading={isFetchingNextPage} onClick={() => fetchNextPage()} type="default">
              Load more connectors
            </Button>
          </Center>
        )}
      </Flexbox>
    </Flexbox>
  );
});

IntegrationsCatalog.displayName = 'IntegrationsCatalog';

export default IntegrationsCatalog;
