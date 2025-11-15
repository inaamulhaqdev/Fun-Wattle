import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { API_URL } from '@/config/api';
import { supabase } from '@/config/supabase';

interface Message {
  id: string;
  sender_id: string;
  message_content: string;
  timestamp: string;
}

export default function ChatMessages() {
  const router = useRouter();
  const { chat_room_id, recipient_name } = useLocalSearchParams<{ chat_room_id: string; recipient_name: string }>();
  const { profileId, session } = useApp();
  const token = session?.access_token;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch messages from the database
  useEffect(() => {
    if (!chat_room_id || !token) {
      Alert.alert('Error', 'Missing chat room ID or token');
      return;
    }

    fetchMessages();
  }, [chat_room_id, token]);

  // Subscribe to realtime message updates from Chat_Message table in Supabase
  useEffect(() => {
    if (!chat_room_id) {
      Alert.alert('Error', 'Missing chat room ID');
      return;
    }

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Chat_Message',
          filter: `chat_room_id=eq.${chat_room_id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prevMessages) => {
            return [...prevMessages, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [chat_room_id]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/${chat_room_id}/messages/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages (${response.status})`);
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !profileId || !token) {
      Alert.alert('Error', 'Missing input, profile ID, or token');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/chat/${chat_room_id}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_profile_id: profileId,
          message_content: input.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message (${response.status})`);
      }

      setInput('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* header - recipient's name */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/(parent-tabs)/chat-rooms')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.headerName}>{recipient_name || 'Chat'}</Text>
        </TouchableOpacity>
      </View>

      {/* chat messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const previous = messages[index - 1];
          const showTime = !previous || Math.abs(new Date(item.timestamp).getTime() - new Date(previous.timestamp).getTime()) > 10 * 60 * 1000; // show the time if 10+ min gap between messages

          const isMyMessage = item.sender_id === profileId;

          return (
            <View>
              {showTime && (
                <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
              )}
              <View
                style={[
                  styles.messageBubble,
                  isMyMessage ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  isMyMessage && { color: 'white' },
                ]}
              >
                {item.message_content}
              </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.chatArea}
      />

      {/* sender message area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* recepient details pop-up modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeIcon}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{recipient_name || 'Chat'}</Text>
            <Text style={styles.modalText}>Email: Contact details coming soon</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    paddingTop: 65,
    paddingBottom: 15,
    backgroundColor: '#fd9029',
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    bottom: 15,
    zIndex: 10,
    padding: 8,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white'
  },
  chatArea: { padding: 16 },
  timestamp: {
    alignSelf: 'center',
    fontSize: 12,
    color: '#777',
    marginVertical: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
  },
  myMessage: {
    backgroundColor: '#fd9029',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: { fontSize: 16 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#fd9029',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 15
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5
  },
  modalText:
  { fontSize: 15,
    marginBottom: 5,
    textAlign: 'center'
  },
});
