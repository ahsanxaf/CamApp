import React, { ReactNode, createContext, useContext, useState } from 'react';

export type CameraNamingScheme = {
    type: 'datetime' | 'sequence';
    prefix: string;
    sequence?: string;
};

type NamingSchemeContextType = {
    namingScheme: CameraNamingScheme;
    setNamingScheme: React.Dispatch<React.SetStateAction<CameraNamingScheme>>;
};

const NamingSchemeContext = createContext<NamingSchemeContextType | undefined>(undefined);

export const useNamingScheme = () => {
    const context = useContext(NamingSchemeContext);
    if (!context) {
        throw new Error('useNamingScheme must be used within a NamingSchemeProvider');
    }
    return context;
};

export const NamingSchemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [namingScheme, setNamingScheme] = useState<CameraNamingScheme>({
        type: 'datetime',
        prefix: '',
    });

    return (
        <NamingSchemeContext.Provider value={{ namingScheme, setNamingScheme }}>
            {children}
        </NamingSchemeContext.Provider>
    );
};
