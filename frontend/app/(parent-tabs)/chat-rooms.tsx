import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ChatRooms() {
  const router = useRouter();

  const rooms = [
    { id: '1', name: 'Dr. Emily Carter', previousMessage: "Are you available for a call to discuss Jasmine's progress?" },
    { id: '2', name: "Dr. James Brown", previousMessage: "Are you available for a call to discuss Jasmine's progress?" },
  ];

  const openRoom = () => {
    router.push('/chat-messages');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.room} onPress={openRoom}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
            </View>
            <View style={styles.roomText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
                {item.previousMessage}
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
