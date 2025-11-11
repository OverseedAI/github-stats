import { useRouter } from 'next/router';
import { type ReactNode } from 'react';

import { useSession } from '@/utils/session';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    // No authentication required since we removed the backend
    return children;
};
