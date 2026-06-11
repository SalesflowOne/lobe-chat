import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { enableSupabaseAuth } from '@/const/auth';

const Page = ({ children }: PropsWithChildren) => {
  if (!enableSupabaseAuth) return notFound();

  return (
    <Flexbox height={'100%'} width={'100%'}>
      <Center height={'100%'} width={'100%'}>
        {children}
      </Center>
    </Flexbox>
  );
};

export default Page;
