import { Button, Flex, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormItem } from '@/components/Form';
import { AuthLayout } from '@/components/Layout';
import { api } from '@/utils/api';

const schema = z.object({
    email: z
        .string()
        .min(1, { message: 'Please provide the email address.' })
        .email({ message: 'Invalid email address' }),
});

interface Inputs {
    email: string;
}

export default function ForgotPassword() {
    const forgotPassword = api.auth.forgotPassword.useMutation();
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
    });

    const [submitted, setSubmitted] = useState(false);

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        forgotPassword.mutate(
            {
                email: data.email,
            },
            {
                onSuccess: () => {
                    setSubmitted(true);
                },
            }
        );
    };
    return (
        <AuthLayout title="Forgot Password?" backButtonUrl="/login" containerProps={{ maxW: 400 }}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-start gap-4">
                <FormItem
                    name="email"
                    register={register}
                    errors={errors}
                    inputProps={{ type: 'email' }}
                />
                {submitted && (
                    <Text>
                        An email has been sent to that address with password reset instructions.
                    </Text>
                )}
                <Flex justify="space-between" align="center" width="100%">
                    <Button
                        isLoading={isSubmitting}
                        type="submit"
                        colorScheme="blue"
                        isDisabled={submitted}
                    >
                        {submitted ? 'Submitted!' : 'Submit'}
                    </Button>
                </Flex>
            </form>
        </AuthLayout>
    );
}
