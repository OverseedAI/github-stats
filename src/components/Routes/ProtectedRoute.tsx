import { useRouter } from 'next/router';
import { type ReactNode } from 'react';

import { useSession } from '@/utils/session';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const router = useRouter();
    const session = useSession();

    if (session.status === 'loading') {
        return 'Loading...';
    }

    if (session.status === 'unauthenticated') {
        void router.push('/login');
    }

    return children;
};
