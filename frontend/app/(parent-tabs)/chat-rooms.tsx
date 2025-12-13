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

  // Fetch children profiles for the start chat modal
  const fetchChildren = React.useCallback(async () => {
    if (!userId || !token) return;

    try {
      const response = await fetch(`${API_URL}/profile/${userId}/list/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch profiles');
      
      const profiles = await response.json();
      const children = profiles.filter((p: any) => p.profile_type === 'child');
      setChildrenProfiles(children);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  }, [userId, token]);

  const handleStartChat = async (childId: string, childName: string) => {
    setCreatingRoom(true);
    try {
      // Get all assignments for this child to find therapist
      const assignmentsResp = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`);
      if (!assignmentsResp.ok) throw new Error('Failed to fetch assignments');
      
      const assignments = await assignmentsResp.json();
      
      if (assignments.length === 0) {
        Alert.alert('No Therapist', 'This child has no therapist assigned yet.');
        setCreatingRoom(false);
        return;
      }

      // Get the therapist who assigned these learning units
      const therapistUserId = assignments[0].assigned_by.id;
      
      // Get therapist's profile
      const therapistProfileResp = await fetch(`${API_URL}/profile/${therapistUserId}/list/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!therapistProfileResp.ok) throw new Error('Failed to fetch therapist profile');
      
      const therapistProfiles = await therapistProfileResp.json();
      const therapistProfile = therapistProfiles.find((p: any) => p.profile_type === 'therapist');
      
      if (!therapistProfile) {
        Alert.alert('Error', 'Could not find therapist profile');
        setCreatingRoom(false);
        return;
      }

      // Create chat room
      const createRoomResp = await fetch(`${API_URL}/chat/create-room/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile_1_id: profileId,
          profile_2_id: therapistProfile.id,
          child_id: childId,
        }),
      });

      if (!createRoomResp.ok) throw new Error('Failed to create chat room');

      const result = await createRoomResp.json();
      
      // Refresh chat rooms
      await fetch_rooms_data();
      
      setShowStartChatModal(false);
      Alert.alert('Success', `Chat created with ${therapistProfile.name} for ${childName}`);
      
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
            <Text style={styles.emptySubtext}>Tap the + button to start a chat with your child's therapist</Text>
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

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openStartChatModal}
        color="#fff"
      />

      {/* Start Chat Modal */}
      <Modal
        visible={showStartChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStartChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start a Chat</Text>
              <TouchableOpacity onPress={() => setShowStartChatModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Select a child to chat with their therapist:</Text>
            
            <ScrollView style={styles.childrenList}>
              {childrenProfiles.length === 0 ? (
                <Text style={styles.noChildrenText}>No children found. Please add a child first.</Text>
              ) : (
                childrenProfiles.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={styles.childItem}
                    onPress={() => handleStartChat(child.id, child.name)}
                    disabled={creatingRoom}
                  >
                    <Image
                      source={child.profile_picture ? { uri: child.profile_picture } : genericProfilePic}
                      style={styles.childAvatar}
                    />
                    <Text style={styles.childName}>{child.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            
            {creatingRoom && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FD902B" />
                <Text style={styles.loadingText}>Creating chat...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#FD902B',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    childrenList: {
        maxHeight: 400,
    },
    childItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    childAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
        marginRight: 12,
    },
    childName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    noChildrenText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#FD902B',
    },
});