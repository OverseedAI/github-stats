import React, { createContext, useContext } from 'react';

type Status = 'unauthenticated';

export interface SessionData {
    user: null;
    organization: null;
    status: Status;
    revalidate: () => void;
}

const SessionContext = createContext<SessionData>({
    user: null,
    organization: null,
    status: 'unauthenticated',
    revalidate: () => null,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const revalidate = () => {
        // No-op since we don't have a backend
    };

    return (
        <SessionContext.Provider value={{ user: null, status: 'unauthenticated', organization: null, revalidate }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    return useContext(SessionContext);
};
