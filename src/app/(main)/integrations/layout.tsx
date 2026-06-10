import ServerLayout from '@/components/server/ServerLayout';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

const IntegrationsLayout = ServerLayout<LayoutProps>({ Desktop, Mobile });

IntegrationsLayout.displayName = 'IntegrationsLayout';

export default IntegrationsLayout;
