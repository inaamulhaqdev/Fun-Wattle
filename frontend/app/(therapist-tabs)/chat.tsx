import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'them',
      text: 'Let me know if I can provide you with anymore information.',
      timestamp: new Date('2025-11-13T10:30:00'),
    },
    {
      id: '2',
      sender: 'me',
      text: 'Are you available for a call to discuss Jasmine\'s progress?',
      timestamp: new Date('2025-11-13T10:32:00'),
    },
  ]);
  const [input, setInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: 'me',
      text: input,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.headerName}>Dr. Emily Carter</Text>
        </TouchableOpacity>
      </View>

      {/* Chat messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const previous = messages[index - 1];
          const showTime =
            !previous ||
            Math.abs(item.timestamp.getTime() - previous.timestamp.getTime()) > 10 * 60 * 1000; // show if 5+ min gap

          return (
            <View>
              {showTime && (
                <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
              )}
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'me' ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text style={[
                  styles.messageText, 
                  item.sender == 'me' && { color: 'white' }, 
                ]}
              >
                {item.text}
              </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.chatArea}
      />

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
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

            <Text style={styles.modalTitle}>Dr. Emily Carter</Text>
            <Text style={styles.modalSubtitle}>Clinical Psychologist</Text>
            <Text style={styles.modalText}>Email: emily.carter@wellmind.com</Text>
            <Text style={styles.modalText}>Experience: 8 years</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingTop: 65,
    paddingBottom: 15,
    backgroundColor: '#fd9029',
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  headerName: { fontSize: 18, fontWeight: '600', color: '#333' },

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
  sendText: { fontWeight: 'bold', color: 'white', fontSize: 15 },

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
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  modalSubtitle: { fontSize: 16, color: '#666', marginBottom: 15 },
  modalText: { fontSize: 15, marginBottom: 5, textAlign: 'center' },
});
