import { Button, Flex, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import React from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormItem } from '@/components/Form';
import { AuthLayout } from '@/components/Layout';
import { useToast } from '@/hooks';
import { api } from '@/utils/api';
import { useSession } from '@/utils/session';

const schema = z.object({
    password: z
        .string()
        .min(8, { message: 'Must be at least 8 characters long.' })
        .regex(/(?=.*?[A-Z])/, {
            message: 'Must include at least one uppercase letter.',
        })
        .regex(/(?=.*?[a-z])/, {
            message: 'Must include at least one lowercase letter.',
        })
        .regex(/(?=.*?[0-9])/, {
            message: 'Must include at least one number.',
        })
        .regex(/(?=.*?[#?!@$%^&*-])/, {
            message: 'Must include at least one special character.',
        }),
});

interface Inputs {
    password: string;
}

export default function ResetPassword() {
    const session = useSession();
    const toast = useToast();
    const router = useRouter();

    const resetPassword = api.auth.resetPassword.useMutation();

    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        resetPassword.mutate(
            {
                password: data.password,
                email: String(router.query.email),
                resetToken: String(router.query.token),
            },
            {
                onSuccess: () => {
                    session.revalidate();
                    void router.push('/app');
                    toast({
                        title: 'Password updated!',
                        description: 'Please log in with your new credentials.',
                    });
                },
            }
        );
    };

    return (
        <AuthLayout title="Reset Your Password" containerProps={{ maxW: 400 }}>
            <Text mb={4}>Please enter your new password below.</Text>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-start gap-4">
                <FormItem
                    name="password"
                    register={register}
                    errors={errors}
                    inputProps={{ type: 'password' }}
                />
                <Flex justify="space-between" align="center" width="100%">
                    <Button isLoading={isSubmitting} type="submit" colorScheme="blue">
                        Submit
                    </Button>
                </Flex>
            </form>
        </AuthLayout>
    );
}
