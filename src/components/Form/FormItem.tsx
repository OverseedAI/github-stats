import {
    FormControl,
    type FormControlProps,
    FormErrorMessage,
    FormLabel,
    Input,
    type InputProps,
} from '@chakra-ui/react';
import React from 'react';
import {
    type FieldError,
    type FieldErrors,
    type FieldValues,
    type RegisterOptions,
    type UseFormRegister,
} from 'react-hook-form';

import { capitalize } from '@/utils/text';

interface FormItemProps<T extends FieldValues> extends FormControlProps {
    name: string;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    options?: RegisterOptions;
    inputProps?: InputProps;
}

export const FormItem = ({
    name,
    register,
    options,
    errors,
    inputProps,
    ...rest
}: FormItemProps<any>) => {
    const error = errors[name] as FieldError;

    return (
        <FormControl isInvalid={Boolean(error)} {...rest}>
            <FormLabel htmlFor={name}>{capitalize(name)}</FormLabel>
            <Input id={name} placeholder={name} {...inputProps} {...register(name, options)} />

            <FormErrorMessage>{error?.message}</FormErrorMessage>
        </FormControl>
    );
};
