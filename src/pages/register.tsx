import { Text } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';

import { AuthLayout } from '@/components/Layout';

export default function Register() {
    return (
        <AuthLayout
            title="Register"
            containerProps={{ maxWidth: 520 }}
            actions={<Link href="/login">have an account? log instead!</Link>}
        >
            <Text>Registration functionality removed (no backend).</Text>
        </AuthLayout>
    );
}
