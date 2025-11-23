// This temporarily holds child-related data across multiple components/pages before creating the childs profile

import React, { createContext, useContext, useState } from 'react';
import { CommunicationNeeds } from '@/components/AddChildCommunicationNeeds';

interface ChildContextType {
  childName: string;
  dateOfBirth: string;
  childTopGoal: string;
  childHomePracticeFrequency: string;
  childInstructionsAbility: string;
  childPreferredActivities: string[];
  childMotivations: string[];
  childAttendedTherapist: string;
  childCommunicationNeeds: CommunicationNeeds[];
  setDateOfBirth: (date: string) => void;
  setChildName: (name: string) => void;
  setChildTopGoal: (goal: string) => void;
  setChildHomePracticeFrequency: (frequency: string) => void;
  setChildInstructionsAbility: (ability: string) => void;
  setChildPreferredActivities: (activities: string[]) => void;
  setChildMotivations: (motivations: string[]) => void;
  setChildAttendedTherapist: (attended: string) => void;
  setChildCommunicationNeeds: (communication_needs: CommunicationNeeds[]) => void;
}

const ChildContext = createContext<ChildContextType>({
  childName: '',
  dateOfBirth: '',
  childTopGoal: '',
  childHomePracticeFrequency: '',
  childInstructionsAbility: '',
  childPreferredActivities: [],
  childMotivations: [],
  childAttendedTherapist: '',
  childCommunicationNeeds: [],
  setChildName: () => {},
  setDateOfBirth: () => {},
  setChildTopGoal: () => {},
  setChildHomePracticeFrequency: () => {},
  setChildInstructionsAbility: () => {},
  setChildPreferredActivities: () => {},
  setChildMotivations: () => {},
  setChildAttendedTherapist: () => {},
  setChildCommunicationNeeds: () => {},
});

export const ChildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [childTopGoal, setChildTopGoal] = useState('');
  const [childHomePracticeFrequency, setChildHomePracticeFrequency] = useState('');
  const [childInstructionsAbility, setChildInstructionsAbility] = useState('');
  const [childPreferredActivities, setChildPreferredActivities] = useState<string[]>([]);
  const [childMotivations, setChildMotivations] = useState<string[]>([]);
  const [childAttendedTherapist, setChildAttendedTherapist] = useState('');
  const [childCommunicationNeeds, setChildCommunicationNeeds] = useState<CommunicationNeeds[]>([]);

  return (
    <ChildContext.Provider 
      value={{ 
        childName, 
        setChildName, 
        dateOfBirth,
        setDateOfBirth, 
        childTopGoal, 
        setChildTopGoal, 
        childHomePracticeFrequency,
        setChildHomePracticeFrequency, 
        childInstructionsAbility, 
        setChildInstructionsAbility, 
        childPreferredActivities, 
        setChildPreferredActivities, 
        childMotivations, 
        setChildMotivations, 
        childAttendedTherapist, 
        setChildAttendedTherapist,
        childCommunicationNeeds,
        setChildCommunicationNeeds
      }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => useContext(ChildContext);
