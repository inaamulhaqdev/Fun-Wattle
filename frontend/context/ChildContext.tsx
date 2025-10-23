import React, { createContext, useContext, useState } from 'react';

interface ChildContextType {
  childName: string;
  setChildName: (name: string) => void;
}

const ChildContext = createContext<ChildContextType>({
  childName: '',
  setChildName: () => {},
});

export const ChildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childName, setChildName] = useState('');
  return (
    <ChildContext.Provider value={{ childName, setChildName }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => useContext(ChildContext);
