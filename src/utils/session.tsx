import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { useToast } from '@/hooks';
import { type Organization, type User, type UsersToOrganizations } from '@/schemas';
import { api } from '@/utils/api';

type Status = 'authenticated' | 'loading' | 'unauthenticated';
type UserWithOrganizations = User & {
    usersToOrganizations: Array<
        UsersToOrganizations & {
            organization: Organization;
        }
    >;
};

export interface SessionData {
    user: UserWithOrganizations | null;
    organization: Organization | null;
    status: Status;
    revalidate: () => void;
}

const SessionContext = createContext<SessionData>({
    user: null,
    organization: null,
    status: 'loading',
    revalidate: () => null,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const toast = useToast();
    const [user, setUser] = useState<UserWithOrganizations | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [status, setStatus] = useState<Status>('loading');
    const [isCheckEnabled, setIsCheckEnabled] = useState(false);
    const { isFetched, isSuccess, data } = api.auth.checkMe.useQuery(undefined, {
        enabled: isCheckEnabled,
        retry: false,
    });
    const organizationSlug = router.query.organizationSlug;

    useEffect(() => {
        if (status === 'loading') {
            setIsCheckEnabled(true);
        }
    }, [status]);

    useEffect(() => {
        if (isFetched) {
            if (isSuccess && data) {
                setUser(data);
                setStatus('authenticated');

                if (organizationSlug) {
                    const foundOrganization = data.usersToOrganizations.find(
                        ({ organization: userOrganization }) =>
                            userOrganization.slug === organizationSlug
                    );

                    if (foundOrganization) {
                        setOrganization(foundOrganization.organization);
                    } else {
                        void router.push('/app');
                        toast({
                            title: 'You do not belong to this organization.',
                            status: 'error',
                        });
                    }
                }
            } else {
                setStatus('unauthenticated');
            }

            setIsCheckEnabled(false);
        }
    }, [data, isFetched, isSuccess]);

    const revalidate = () => {
        setStatus('loading');
    };

    return (
        <SessionContext.Provider value={{ user, status, organization: organization, revalidate }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    return useContext(SessionContext);
};
