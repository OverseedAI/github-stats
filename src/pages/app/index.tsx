import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { AppLayout } from '@/components/Layout';
import { useSession } from '@/utils/session';

export default function AppPage() {
    const router = useRouter();
    const { user } = useSession();

    useEffect(() => {
        if (!user || !user.usersToOrganizations.length) return;

        if (user.usersToOrganizations[0]) {
            const firstOrganization = user?.usersToOrganizations[0].organization;

            void router.push('/app/' + firstOrganization?.slug + '/dashboard');
        } else {
            console.error('No organizations found.');
        }
    }, [user]);

    return <AppLayout>Loading...</AppLayout>;
}
