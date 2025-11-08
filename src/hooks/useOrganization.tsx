import { useRouter } from 'next/router';

import { useSession } from '@/utils/session';

interface UseOrganizationProps {}

export const useOrganization = ({}: UseOrganizationProps = {}) => {
    const router = useRouter();
    const orgSlug = router.query.organizationSlug;

    const { user } = useSession();

    if (orgSlug && user) {
        const foundOrganization = user.usersToOrganizations.find(
            ({ organization: userOrganization }) => userOrganization.slug === orgSlug
        );

        if (foundOrganization) {
            return foundOrganization.organization;
        }
    }

    return null;
};

export const useOrgSlug = () => {
    const router = useRouter();

    return router.query.organizationSlug;
};
