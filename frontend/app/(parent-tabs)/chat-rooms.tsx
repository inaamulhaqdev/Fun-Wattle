import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/api';
import { useApp } from '@/context/AppContext';
import { Alert } from 'react-native';
import { supabase } from '@/config/supabase';

export default function ChatRooms() {
  const router = useRouter();
  const { profileId, session, chatRooms, setChatRooms, updateRoomLastMessage } = useApp();
  const token = session?.access_token;
  const isFetching = React.useRef(false);

  const fetch_rooms_data = React.useCallback(async () => {
    if (!profileId || !token || isFetching.current) {
      return;
    }

    isFetching.current = true;
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
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch chat rooms');
    } finally {
      isFetching.current = false;
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

  // Fetch rooms on mount only if cache is empty (typically first load)
  React.useEffect(() => {
    if (chatRooms.length === 0) {
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
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.room} onPress={() => openRoom(item.id, item.name)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
            </View>
            <View style={styles.roomText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
                {item.last_message}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        margin: 16,
        marginTop: 8,
    },
    room: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fd9029',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: '700'
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
    separator: {
        height: 1,
        backgroundColor: '#eee',
        width: '100%',
    },
});
