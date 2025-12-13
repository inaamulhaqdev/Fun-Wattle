import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, ScrollView } from 'react-native';
import { ActivityIndicator, Button, FAB, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/api';
import { useApp } from '@/context/AppContext';
import { Alert } from 'react-native';
import { supabase } from '@/config/supabase';
import { Ionicons } from '@expo/vector-icons';

const genericProfilePic = require('@/assets/images/default-profile-pic.jpeg');

interface ChildProfile {
  id: string;
  name: string;
  profile_picture?: string;
}

export default function ChatRooms() {
  const router = useRouter();
  const { darkMode, profileId, session, chatRooms, setChatRooms, updateRoomLastMessage } = useApp();
  const token = session?.access_token;
  const userId = session?.user?.id;
  const isFetching = React.useRef(false);
  const hasFetched = React.useRef(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(false);
  const [showStartChatModal, setShowStartChatModal] = React.useState(false);
  const [childrenProfiles, setChildrenProfiles] = React.useState<ChildProfile[]>([]);
  const [creatingRoom, setCreatingRoom] = React.useState(false);

  const fetch_rooms_data = React.useCallback(async () => {
    if (!profileId || !token || isFetching.current) {
      return;
    }

    isFetching.current = true;
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat/${profileId}/rooms/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setChatRooms(data);
      hasFetched.current = true;
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch chat rooms');
      hasFetched.current = true;
    } finally {
      isFetching.current = false;
      setIsInitialLoading(false);
    }
  }, [profileId, token, setChatRooms]);

  // Subscribe to realtime message updates from Chat_Message table in Supabase (so last_message updates in the room list are realtime)
  React.useEffect(() => {
    if (!profileId || chatRooms.length === 0) return;

    const channel = supabase
      .channel('chat-rooms-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Chat_Message',
        },
        (payload) => {
          // Update room's last message into cache if it's one of our rooms
          const newMessage = payload.new as any;
          const isOurRoom = chatRooms.some(room => room.id === newMessage.chat_room_id);
          if (isOurRoom && newMessage.chat_room_id && newMessage.message_content) {
            updateRoomLastMessage(newMessage.chat_room_id, newMessage.message_content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, chatRooms, updateRoomLastMessage]);

  // Fetch rooms on mount only if cache is empty and we haven't fetched yet
  React.useEffect(() => {
    if (chatRooms.length === 0 && !hasFetched.current) {
      fetch_rooms_data();
    }
  }, [fetch_rooms_data, chatRooms.length]);

  // Fetch children profiles that therapist has assigned learning units to
  const fetchChildren = React.useCallback(async () => {
    if (!userId || !token) return;

    try {
      // Get all assignments created by this therapist
      const response = await fetch(`${API_URL}/assignment/${userId}/assigned_by/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch assignments');
      
      const assignments = await response.json();
      
      // Get unique children from assignments
      const uniqueChildren = new Map();
      assignments.forEach((assignment: any) => {
        const child = assignment.assigned_to;
        if (!uniqueChildren.has(child.id)) {
          uniqueChildren.set(child.id, {
            id: child.id,
            name: child.name,
            profile_picture: child.profile_picture
          });
        }
      });
      
      setChildrenProfiles(Array.from(uniqueChildren.values()));
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  }, [userId, token]);

  const handleStartChat = async (childId: string, childName: string) => {
    setCreatingRoom(true);
    try {
      // Get the child's parent profile
      const childProfileResp = await fetch(`${API_URL}/profile/${childId}/data/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!childProfileResp.ok) throw new Error('Failed to fetch child profile');
      
      const childProfile = await childProfileResp.json();
      
      // Get all profiles linked to the child's user to find parent
      const assignmentsResp = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`);
      if (!assignmentsResp.ok) throw new Error('Failed to fetch child assignments');
      
      const assignments = await assignmentsResp.json();
      if (assignments.length === 0) {
        Alert.alert('No Parent', 'Could not find parent for this child.');
        setCreatingRoom(false);
        return;
      }

      // Get parent's user ID from the first assignment's assigned_to profile
      // We need to find the parent profile from User_Profile table
      // For now, we'll use a workaround - get parent from therapist's assignments
      
      // Simpler approach: Get all users and find the one with this child
      const usersResp = await fetch(`${API_URL}/profile/${userId}/list/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!usersResp.ok) throw new Error('Failed to fetch profiles');
      
      // Since we can't easily get parent from child, we'll create endpoint for it
      // For now, show error
      Alert.alert('Info', 'Please ask the parent to initiate the chat from their side.');
      setCreatingRoom(false);
      return;

    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat. Please try again.');
    } finally {
      setCreatingRoom(false);
    }
  };

  const openStartChatModal = () => {
    fetchChildren();
    setShowStartChatModal(true);
  };

  const openRoom = (roomId: string, roomName: string) => {
    router.push({
      pathname: '/chat-messages',
      params: { chat_room_id: roomId, recipient_name: roomName }
    });
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Messages</Text>
      </View>

      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
        {isInitialLoading && chatRooms.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FD902B" />
          </View>
        ) : chatRooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no messages yet.</Text>
            <Text style={styles.emptySubtext}>Parents can start a chat with you</Text>
          </View>
        ) : (
          <FlatList
            data={chatRooms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.roomWrapper} onPress={() => openRoom(item.id, item.name)}>
                <View style={styles.room}>
                  <Image
                    source={item.profile_picture ? { uri: item.profile_picture } : genericProfilePic}
                    style={styles.avatar}
                  />
                  <View style={styles.roomText}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Chip 
                        mode="outlined" 
                        style={styles.childChip}
                        textStyle={styles.chipText}
                      >
                        {item.child_name || 'Child'}
                      </Chip>
                    </View>
                    <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
                      {item.last_message}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
        />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    title: {
      fontSize: 20,
      paddingBottom: 15,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    header: {
      backgroundColor: '#fd9029',
      paddingHorizontal: 20,
      paddingTop: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roomWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    room: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ddd',
    },
    roomText: {
        marginLeft: 12,
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flexShrink: 1,
    },
    childChip: {
        height: 28,
        backgroundColor: '#FFF3E0',
        borderColor: '#FD902B',
        flexShrink: 0,
    },
    chipText: {
        fontSize: 11,
        color: '#FD902B',
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 8,
        textAlign: 'center',
    },
});