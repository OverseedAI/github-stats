import { Text } from '@chakra-ui/react';
import React from 'react';

import { AuthLayout } from '@/components/Layout';

export default function Login() {
    return (
        <AuthLayout
            title="Login"
            containerProps={{ maxWidth: 520 }}
            backButtonUrl="/"
        >
            <Text>Login functionality removed (no backend).</Text>
        </AuthLayout>
    );
}
