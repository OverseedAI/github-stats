import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { AppLayout } from '@/components/Layout';

export default function AppPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home since we don't have backend/auth
        void router.push('/');
    }, [router]);

    return <AppLayout>Loading...</AppLayout>;
}
