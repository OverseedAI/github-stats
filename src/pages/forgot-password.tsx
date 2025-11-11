import { Text } from '@chakra-ui/react';
import React from 'react';

import { AuthLayout } from '@/components/Layout';

export default function ForgotPassword() {
    return (
        <AuthLayout title="Forgot Password?" backButtonUrl="/login" containerProps={{ maxW: 400 }}>
            <Text>Password reset functionality removed (no backend).</Text>
        </AuthLayout>
    );
}
