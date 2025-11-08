import { Button, Flex } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
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
    name: z
        .string()
        .min(1, { message: 'Please provide your name.' })
        .max(255, { message: 'Name cannot be longer than 255 characters.' }),
    email: z.string().email({ message: 'Invalid email address' }),
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
    name: string;
    email: string;
    password: string;
}

export default function Register() {
    const toast = useToast();
    const router = useRouter();
    const session = useSession();

    const registration = api.auth.register.useMutation();
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        registration.mutate(
            {
                name: data.name,
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    toast({
                        title: 'Registered successfully!',
                        status: 'success',
                    });
                    session.revalidate();
                    void router.push('/app');
                },
            }
        );
    };

    return (
        <AuthLayout
            title="Register"
            containerProps={{ maxWidth: 520 }}
            actions={<Link href="/login">have an account? log instead!</Link>}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-start gap-4">
                <FormItem name="name" register={register} errors={errors} />
                <FormItem
                    name="email"
                    register={register}
                    errors={errors}
                    inputProps={{ type: 'email' }}
                />
                <FormItem
                    name="password"
                    register={register}
                    errors={errors}
                    inputProps={{ type: 'password' }}
                />
                <Flex justify="space-between" align="center" width="100%">
                    <Button isLoading={isSubmitting} type="submit" colorScheme="blue">
                        Register
                    </Button>
                </Flex>
            </form>
        </AuthLayout>
    );
}
