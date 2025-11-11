import { Text } from '@chakra-ui/react';
import React from 'react';

import { AuthLayout } from '@/components/Layout';

export default function ResetPassword() {
    return (
        <AuthLayout title="Reset Your Password" containerProps={{ maxW: 400 }}>
            <Text>Password reset functionality removed (no backend).</Text>
        </AuthLayout>
    );
}
