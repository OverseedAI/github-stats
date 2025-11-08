import React, { useState } from 'react';

interface UsePaginationProps {
    defaultPage: number;
    defaultPerPage: number;
}

export const usePagination = (
    { defaultPage, defaultPerPage }: UsePaginationProps = {
        defaultPage: 1,
        defaultPerPage: 10,
    }
) => {
    const [page, setPage] = useState(defaultPage);
    const [perPage, setPerPage] = useState(defaultPerPage);

    return { page, setPage, perPage, setPerPage };
};
