// This temporarily holds registration data across multiple steps before actually creating the account

import { createContext, useContext, useState } from 'react';

type NewUserData = {
  email: string;
  password: string;
  userType: 'parent' | 'therapist' | null;
  signedPrivacyPolicy: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setUserType: (type: 'parent' | 'therapist' | null) => void;
  setSignedPrivacyPolicy: (signed: boolean) => void;
};

const RegistrationContext = createContext<NewUserData | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'parent' | 'therapist' | null>(null);
  const [signedPrivacyPolicy, setSignedPrivacyPolicy] = useState(false);

  return (
    <RegistrationContext.Provider value={{ email, setEmail, password, setPassword, userType, setUserType, signedPrivacyPolicy, setSignedPrivacyPolicy }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
};