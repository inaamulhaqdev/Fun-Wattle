import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ActivityIndicator, FAB, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/api';
import { useApp } from '@/context/AppContext';
import { Alert } from 'react-native';
import { supabase } from '@/config/supabase';

const genericProfilePic = require('@/assets/images/default-profile-pic.jpeg');

export default function ChatRooms() {
  const router = useRouter();
  const { darkMode, profileId, session, chatRooms, setChatRooms, updateRoomLastMessage, childId, selectedChild } = useApp();
  const token = session?.access_token;
  const userId = session?.user?.id;
  const isFetching = React.useRef(false);
  const hasFetched = React.useRef(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(false);
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

  const handleStartChat = async () => {
    if (!childId || !selectedChild) {
      Alert.alert('Error', 'No child selected. Please select a child profile first.');
      return;
    }

    setCreatingRoom(true);
    try {
      // First, check if there's already a chat room for this child
      const existingRoom = chatRooms.find((room: any) => room.child?.id === childId);
      
      if (existingRoom) {
        // Room already exists, just open it
        openRoom(existingRoom.id, existingRoom.room_name || existingRoom.name);
        setCreatingRoom(false);
        return;
      }

      // Get all therapist profiles
      const therapistsResp = await fetch(`${API_URL}/therapist/`);
      if (!therapistsResp.ok) throw new Error('Failed to fetch therapists');
      
      const allTherapists = await therapistsResp.json();
      console.log('All therapists:', allTherapists);
      
      if (!userId) throw new Error('User ID not available');
      
      // Check assignments to find therapist (if any assignments exist)
      let linkedTherapistProfile = null;
      
      try {
        const assignmentsResp = await fetch(`${API_URL}/assignment/${childId}/assigned_to/`);
        if (assignmentsResp.ok) {
          const assignments = await assignmentsResp.json();
          console.log('Assignments for child:', assignments);
          
          if (assignments.length > 0) {
            // Get the therapist user ID from assignment
            const assignerUserId = assignments[0].assigned_by?.id;
            
            // Check if assigner is a therapist
            const assignerUserResp = await fetch(`${API_URL}/profile/${assignerUserId}/list/`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (assignerUserResp.ok) {
              const assignerProfiles = await assignerUserResp.json();
              linkedTherapistProfile = assignerProfiles.find((p: any) => p.profile_type === 'therapist');
              
              if (linkedTherapistProfile) {
                console.log('Found therapist from assignments:', linkedTherapistProfile);
              }
            }
          }
        }
      } catch (err) {
        console.log('Error checking assignments:', err);
      }
      
      // If no therapist found via assignments, check direct link via backend endpoint
      if (!linkedTherapistProfile) {
        console.log('No therapist found from assignments, checking direct links...');
        
        try {
          const childTherapistResp = await fetch(`${API_URL}/child/${childId}/therapist/`);
          
          if (childTherapistResp.ok) {
            linkedTherapistProfile = await childTherapistResp.json();
            console.log('Found linked therapist via direct link:', linkedTherapistProfile);
          } else {
            console.log('No therapist found via direct link endpoint');
          }
        } catch (err) {
          console.log('Error checking direct therapist link:', err);
        }
      }

      console.log('Creating chat room with therapist:', linkedTherapistProfile);

      // Check if therapist was found
      if (!linkedTherapistProfile) {
        Alert.alert(
          'No Therapist Assigned', 
          `${selectedChild.name} doesn't have a therapist assigned yet. Please link a therapist first from Settings > Add Therapist.`
        );
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
          profile_2_id: linkedTherapistProfile.id,
          child_id: childId,
        }),
      });

      if (!createRoomResp.ok) {
        const errorData = await createRoomResp.json().catch(() => ({}));
        if (errorData.error === 'Chat room already exists') {
          // Room already exists, just refresh
          await fetch_rooms_data();
          Alert.alert('Info', `Chat with ${linkedTherapistProfile.name} already exists`);
          setCreatingRoom(false);
          return;
        }
        throw new Error('Failed to create chat room');
      }

      const result = await createRoomResp.json();
      
      // Refresh chat rooms
      await fetch_rooms_data();
      
      Alert.alert('Success', `Chat created with ${linkedTherapistProfile.name} for ${selectedChild.name}`);
      
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat. Please try again.');
    } finally {
      setCreatingRoom(false);
    }
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
            <Text style={styles.emptySubtext}>
              Tap the + button to start a chat with {selectedChild ? `${selectedChild.name}'s` : "your child's"} therapist
            </Text>
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
                        compact
                      >
                        {(item.child_name && item.child_name.length > 16) 
                          ? `${item.child_name.substring(0, 16)}...` 
                          : (item.child_name || 'Child')}
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
      {creatingRoom ? (
        <View style={styles.fabLoading}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      ) : (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleStartChat}
          color="#fff"
          label={selectedChild ? `Chat about ${selectedChild.name}` : "Start Chat"}
        />
      )}
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
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flexShrink: 1,
    },
    childChip: {
        height: 26,
        backgroundColor: '#FFF3E0',
        borderColor: '#FD902B',
        maxWidth: 150,
    },
    chipText: {
        fontSize: 12,
        color: '#FD902B',
        fontWeight: '600',
        lineHeight: 16,
        marginVertical: 0,
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
    fabLoading: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FD902B',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});