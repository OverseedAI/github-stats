import React, { useState } from 'react';

interface UseBooleanProps {}

export const useBoolean = (defaultValue = false) => {
    const [state, setState] = useState(defaultValue);

    const toggle = () => {
        setState((prevState) => !prevState);
    };

    return { state, setState, toggle };
};
