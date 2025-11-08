import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
    styles: {
        global: {
            body: {
                bg: 'gray.100',
            },
        },
    },
    fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
    },
    components: {
        Heading: {
            sizes: {
                lg: {
                    fontSize: '1.5rem',
                },
                xl: {
                    fontSize: '1.875rem',
                },
                '2xl': {
                    fontSize: '2.5rem',
                },
            },
        },
    },
});
