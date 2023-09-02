import React, { ReactNode, createContext, useContext, useState } from 'react';

interface SelectedPathContextType {
  selectedPath: string;
  setSelectedPath: React.Dispatch<React.SetStateAction<string>>;
}

const SelectedPathContext = createContext<SelectedPathContextType | undefined>(undefined);

export const SelectedPathProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPath, setSelectedPath] = useState('');

  return (
    <SelectedPathContext.Provider value={{ selectedPath, setSelectedPath }}>
      {children}
    </SelectedPathContext.Provider>
  );
};

export const useSelectedPath = () => {
  const context = useContext(SelectedPathContext);
  if (!context) {
    throw new Error('useSelectedPath must be used within a SelectedPathProvider');
  }
  return context;
};
