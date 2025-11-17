// This context handles persistent, global, post-login state (e.g. sessions, selected child etc) that we can use throughout the app.
// Feel free to add to this file, just remember its for global app state post-login that needs to persist across sessions.
// This should eliminate the need for passing params through multiple navigation layers.

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { Exercise } from '../types/learningUnitTypes';

interface ChatRoom {
  id: string;
  name: string;
  profile_picture: string;
  last_message: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  message_content: string;
  timestamp: string;
}

interface AppContextType {
  session: any | null;
  selectedChild: any | null;
  profileId: string | null;
  childId: string | null;
  loading: boolean;
  selectChild: (child: any) => Promise<void>;
  setProfile: (profileId: string, childId?: string) => Promise<void>;
  logout: () => Promise<void>;
  exercisesCache: Record<string, Exercise[]>;
  setExercisesForUnit: (unitId: string, exercises: Exercise[]) => Promise<void>;
  chatRooms: ChatRoom[];
  setChatRooms: (rooms: ChatRoom[]) => void;
  updateRoomLastMessage: (roomId: string, lastMessage: string) => void;
  messagesCache: Record<string, ChatMessage[]>;
  setMessagesForRoom: (roomId: string, messages: ChatMessage[]) => void;
  addMessageToRoom: (roomId: string, message: ChatMessage) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [exercisesCache, setExercisesCache] = useState<Record<string, Exercise[]>>({});

  const [chatRooms, setChatRoomsState] = useState<ChatRoom[]>([]);
  const [messagesCache, setMessagesCache] = useState<Record<string, ChatMessage[]>>({});

  useEffect(() => {
    (async () => {
      try {
        // First we try to load session and profile data from storage
        const storedSession = await AsyncStorage.getItem('session');
        const storedChild = await AsyncStorage.getItem('selectedChild');
        const storedProfileId = await AsyncStorage.getItem('profileId');
        const storedChildId = await AsyncStorage.getItem('childId');

        // If we have a stored session, set it in state
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
        }

        // Set stored child, profileId, and childId if they exist
        if (storedChild) setSelectedChild(JSON.parse(storedChild));
        if (storedProfileId) setProfileId(storedProfileId);
        if (storedChildId) setChildId(storedChildId);
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        setLoading(false);
      }
    })();

    // Subscribe to Supabase auth events (login/logout) - this keeps session in sync
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // If we have a new session, set it in state
        if (newSession) {
          setSession(newSession);
          await AsyncStorage.setItem('session', JSON.stringify(newSession));
        // If session is null (logged out), clear stored data
        } else {
          setSession(null);
          await AsyncStorage.removeItem('session');
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Function to select a child and persist the selection (we will mostly use this for switching children)
  const selectChild = async (child: any) => {
    setSelectedChild(child);
    setChildId(child.id);
    await AsyncStorage.setItem('selectedChild', JSON.stringify(child));
    await AsyncStorage.setItem('childId', child.id);
  };

  // Function to set profile when first logging in and optionally child (parents/therapists select first child when logging in)
  const setProfile = async (newProfileId: string, newChildId?: string) => {
    setProfileId(newProfileId);
    if (newChildId) setChildId(newChildId);

    await AsyncStorage.setItem('profileId', newProfileId);
    if (newChildId) {
      await AsyncStorage.setItem('childId', newChildId);
    }
  };

  // Load cached exercises on startup
  useEffect(() => {
    (async () => {
      try {
        const storedExercises = await AsyncStorage.getItem('exercisesCache');
        if (storedExercises) {
          setExercisesCache(JSON.parse(storedExercises));
        }
      } catch (error) {
        console.error('Error loading exercises from storage:', error);
      }
    })();
  }, []);

  // Function to cache exercises
  const setExercisesForUnit = async (unitId: string, exercises: Exercise[]) => {
    setExercisesCache(prev => {
      const newCache = { ...prev, [unitId]: exercises };
      AsyncStorage.setItem('exercisesCache', JSON.stringify(newCache))
        .catch(err => console.error('Error saving exercises to storage:', err));
      return newCache;
    });
  };

  const setChatRooms = (rooms: ChatRoom[]) => {
    setChatRoomsState(rooms);
  };

  const updateRoomLastMessage = (roomId: string, lastMessage: string) => {
    setChatRoomsState((previousRooms) => {
      const updatedRooms = previousRooms.map((room) => {
        if (room.id === roomId) {
          return { ...room, last_message: lastMessage };
        } else {
          return room;
        }
      });
      return updatedRooms;
    });
  };

  const setMessagesForRoom = (roomId: string, messages: ChatMessage[]) => {
    setMessagesCache((previousCache) => {
      const updatedCache = { ...previousCache, [roomId]: messages };
      return updatedCache;
    });
  };

  const addMessageToRoom = (roomId: string, message: ChatMessage) => {
    setMessagesCache((previousCache) => {
      const existingMessages = previousCache[roomId] || [];
      const updatedMessages = [...existingMessages, message];
      const updatedCache = { ...previousCache, [roomId]: updatedMessages };
      return updatedCache;
    });
  };

  // Function to log out, clear session and stored data
  const logout = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.multiRemove(['session', 'selectedChild', 'profileId', 'childId']);
    setSession(null);
    setSelectedChild(null);
    setProfileId(null);
    setChildId(null);
  };

  return (
    <AppContext.Provider
      value={{
        session,
        selectedChild,
        profileId,
        childId,
        loading,
        selectChild,
        setProfile,
        logout,
        exercisesCache,
        setExercisesForUnit,
        chatRooms,
        setChatRooms,
        updateRoomLastMessage,
        messagesCache,
        setMessagesForRoom,
        addMessageToRoom,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
