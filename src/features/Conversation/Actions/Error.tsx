import { ActionIconGroup, type ActionIconGroupProps } from '@lobehub/ui';
import { memo } from 'react';

import { useChatListActionsBar } from '../hooks/useChatListActionsBar';

export const ErrorActionsBar = memo<ActionIconGroupProps>(({ onActionClick }) => {
  const { regenerate, del } = useChatListActionsBar();

  return <ActionIconGroup items={[regenerate, del]} onActionClick={onActionClick} type="ghost" />;
});
