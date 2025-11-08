import { Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import { FormItem } from '@/components/Form';
import { AuthLayout } from '@/components/Layout';
import { useToast } from '@/hooks';
import { api } from '@/utils/api';
import { useSession } from '@/utils/session';

interface Inputs {
    email: string;
    password: string;
}

export default function Login() {
    const toast = useToast();
    const session = useSession();
    const router = useRouter();
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm<Inputs>();
    const login = api.auth.login.useMutation();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        login.mutate(
            { email: data.email, password: data.password },
            {
                onSuccess: () => {
                    session.revalidate();
                    toast({
                        title: 'Logged in successfully!',
                        status: 'success',
                    });
                    void router.push('/app');
                },
            }
        );
    };

    return (
        <AuthLayout
            title="Login"
            containerProps={{ maxWidth: 520 }}
            actions={<Link href="/register">...or create an account!</Link>}
            backButtonUrl="/"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-start gap-4">
                <FormItem name="email" register={register} errors={errors} />
                <FormItem
                    name="password"
                    register={register}
                    errors={errors}
                    inputProps={{ type: 'password' }}
                />
                <Flex justify="space-between" align="center" width="100%">
                    <Button isLoading={isSubmitting} type="submit" colorScheme="blue">
                        Login
                    </Button>
                    <Link href="/forgot-password">Forgot Password</Link>
                </Flex>
            </form>
        </AuthLayout>
    );
}
