import React, { createContext, useContext, useState } from 'react';

const TamilContext = createContext();

export function TamilProvider({ children }) {
    const [tamilMode, setTamilMode] = useState(false);

    return (
        <TamilContext.Provider value={{ tamilMode, setTamilMode }}>
            {children}
        </TamilContext.Provider>
    );
}

export function useTamilMode() {
    const context = useContext(TamilContext);
    if (!context) {
        throw new Error('useTamilMode must be used within a TamilProvider');
    }
    return context;
}
