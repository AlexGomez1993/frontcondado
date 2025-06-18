import * as React from 'react';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { SignInFormClient } from '@/components/auth/sign-in-form-client';

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <SignInFormClient />
      </GuestGuard>
    </Layout>
  );
}
