import { type UseToastOptions, useToast as useChakraToast } from '@chakra-ui/react';

export const useToast = () => {
    const toast = useChakraToast();

    return (options: UseToastOptions) =>
        toast({
            duration: 7000,
            status: 'success',
            position: 'bottom-right',
            ...options,
        });
};
