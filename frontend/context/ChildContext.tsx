// This temporarily holds child-related data across multiple components/pages before creating the childs profile

import React, { createContext, useContext, useState } from 'react';

interface ChildContextType {
  childName: string;
  dateOfBirth: string;
  childTopGoal: string;
  childHomePracticeFrequency: string;
  childPracticeDuration: string;
  childInstructionsAbility: string;
  childPreferredActivities: string[];
  childMotivations: string[];
  childAttendedTherapist: string;
  setDateOfBirth: (date: string) => void;
  setChildName: (name: string) => void;
  setChildTopGoal: (goal: string) => void;
  setChildHomePracticeFrequency: (frequency: string) => void;
  setChildPracticeDuration: (duration: string) => void;
  setChildInstructionsAbility: (ability: string) => void;
  setChildPreferredActivities: (activities: string[]) => void;
  setChildMotivations: (motivations: string[]) => void;
  setChildAttendedTherapist: (attended: string) => void;
}

const ChildContext = createContext<ChildContextType>({
  childName: '',
  dateOfBirth: '',
  childTopGoal: '',
  childHomePracticeFrequency: '',
  childPracticeDuration: '',
  childInstructionsAbility: '',
  childPreferredActivities: [],
  childMotivations: [],
  childAttendedTherapist: '',
  setChildName: () => {},
  setDateOfBirth: () => {},
  setChildTopGoal: () => {},
  setChildHomePracticeFrequency: () => {},
  setChildPracticeDuration: () => {},
  setChildInstructionsAbility: () => {},
  setChildPreferredActivities: () => {},
  setChildMotivations: () => {},
  setChildAttendedTherapist: () => {},
});

export const ChildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [childTopGoal, setChildTopGoal] = useState('');
  const [childHomePracticeFrequency, setChildHomePracticeFrequency] = useState('');
  const [childPracticeDuration, setChildPracticeDuration] = useState('');
  const [childInstructionsAbility, setChildInstructionsAbility] = useState('');
  const [childPreferredActivities, setChildPreferredActivities] = useState<string[]>([]);
  const [childMotivations, setChildMotivations] = useState<string[]>([]);
  const [childAttendedTherapist, setChildAttendedTherapist] = useState('');

  return (
    <ChildContext.Provider value={{ childName, setChildName, dateOfBirth, setDateOfBirth, childTopGoal, setChildTopGoal, childHomePracticeFrequency, setChildHomePracticeFrequency, childPracticeDuration, setChildPracticeDuration, childInstructionsAbility, setChildInstructionsAbility, childPreferredActivities, setChildPreferredActivities, childMotivations, setChildMotivations, childAttendedTherapist, setChildAttendedTherapist }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => useContext(ChildContext);
