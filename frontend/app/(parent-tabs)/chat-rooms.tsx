import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/api';
import { useApp } from '@/context/AppContext';
import { Alert } from 'react-native';
import { supabase } from '@/config/supabase';

const genericProfilePic = require('@/assets/images/default-profile-pic.jpeg');

export default function ChatRooms() {
  const router = useRouter();
  const { profileId, session, chatRooms, setChatRooms, updateRoomLastMessage } = useApp();
  const token = session?.access_token;
  const isFetching = React.useRef(false);
  const hasFetched = React.useRef(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(false);

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
    if (!profileId) return;

    const channel = supabase
      .channel('chat-rooms')
      // Listener 1: for messages where the user is messenger_1
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Chat_Message',
          filter: `messenger_1_id=eq.${profileId}`
        },
        (payload) => {
          // Update room's last message into cache
          const newMessage = payload.new as any;
          if (newMessage.chat_room_id && newMessage.message_content) {
            updateRoomLastMessage(newMessage.chat_room_id, newMessage.message_content);
          }
        }
      )
      // Listener 2: for messages where the user is messenger_2
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Chat_Message',
          filter: `messenger_2_id=eq.${profileId}`
        },
        (payload) => {
          // Update room's last message into cache
          const newMessage = payload.new as any;
          if (newMessage.chat_room_id && newMessage.message_content) {
            updateRoomLastMessage(newMessage.chat_room_id, newMessage.message_content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, updateRoomLastMessage]);

  // Fetch rooms on mount only if cache is empty and we haven't fetched yet
  React.useEffect(() => {
    if (chatRooms.length === 0 && !hasFetched.current) {
      fetch_rooms_data();
    }
  }, [fetch_rooms_data, chatRooms.length]);

  const openRoom = (roomId: string, roomName: string) => {
    router.push({
      pathname: '/chat-messages',
      params: { chat_room_id: roomId, recipient_name: roomName }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Messages</Text>
      {isInitialLoading && chatRooms.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD902B" />
        </View>
      ) : chatRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You have no messages yet.</Text>
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
                  <Text style={styles.name}>{item.name}</Text>
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
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginLeft: 24,
        marginTop: 20,
        marginBottom: 16,
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
    name: {
        fontSize: 16,
        fontWeight: '600'
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
});