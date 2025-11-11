import { useRouter } from 'next/router';

interface UseOrganizationProps {}

export const useOrganization = ({}: UseOrganizationProps = {}) => {
    // No backend, so no organizations
    return null;
};

export const useOrgSlug = () => {
    const router = useRouter();

    return router.query.organizationSlug;
};
