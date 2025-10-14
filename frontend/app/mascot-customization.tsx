import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MascotCustomization = () => {
  const [selectedTab, setSelectedTab] = useState('Body');
  const [selectedAccessory, setSelectedAccessory] = useState(null);

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/child-dashboard');
  };

  const handleRewards = () => {
    // Navigate to rewards page when implemented
    console.log('Rewards pressed');
  };

  const handleMascotCustomization = () => {
    // Already on this page
  };

  const handleSettings = () => {
    // Navigate to settings page when implemented
    console.log('Settings pressed');
  };

  const bodyOptions = [
    { id: 1, name: 'Koala', image: require('@/assets/images/mascot.png') },
    // Add more body options here when you have them
  ];

  const accessoryOptions = [
    { id: 1, name: 'Party Hat', icon: '🎉' },
    { id: 2, name: 'Sunglasses', icon: '🕶️' },
    { id: 3, name: 'Bow Tie', icon: '🎀' },
    { id: 4, name: 'Crown', icon: '👑' },
    { id: 5, name: 'Headphones', icon: '🎧' },
    { id: 6, name: 'Hat', icon: '🎩' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome6 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wardrobe</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Mascot Display Area */}
      <View style={styles.mascotDisplayArea}>
        <Image 
          source={require('@/assets/images/mascot.png')} 
          style={styles.mascotImage}
          resizeMode="contain"
        />
        {selectedAccessory && (
          <View style={styles.accessoryOverlay}>
            <Text style={styles.accessoryEmoji}>{selectedAccessory.icon}</Text>
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'Body' && styles.activeTab]}
          onPress={() => setSelectedTab('Body')}
        >
          <Text style={[styles.tabText, selectedTab === 'Body' && styles.activeTabText]}>
            Body
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'Accessories' && styles.activeTab]}
          onPress={() => setSelectedTab('Accessories')}
        >
          <Text style={[styles.tabText, selectedTab === 'Accessories' && styles.activeTabText]}>
            Accessories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Options Grid */}
      <ScrollView style={styles.optionsContainer}>
        <View style={styles.optionsGrid}>
          {selectedTab === 'Body' ? (
            bodyOptions.map((option) => (
              <TouchableOpacity key={option.id} style={styles.optionItem}>
                <Image source={option.image} style={styles.optionImage} resizeMode="contain" />
              </TouchableOpacity>
            ))
          ) : (
            accessoryOptions.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={[
                  styles.optionItem, 
                  selectedAccessory?.id === option.id && styles.selectedOption
                ]}
                onPress={() => setSelectedAccessory(option)}
              >
                <Text style={styles.optionEmoji}>{option.icon}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={handleHome}>
          <FontAwesome6 name="house-chimney-window" size={40} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleRewards}>
          <FontAwesome5 name="trophy" size={40} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleMascotCustomization}>
          <MaterialCommunityIcons name="koala" size={60} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleSettings}>
          <FontAwesome5 name="cog" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 30,
  },
  mascotDisplayArea: {
    backgroundColor: '#87CEEB',
    height: 300,
    margin: 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mascotImage: {
    width: 350,
    height: 350,
  },
  accessoryOverlay: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
  },
  accessoryEmoji: {
    fontSize: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF8C42',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  optionsContainer: {
    flex: 1,
    padding: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedOption: {
    backgroundColor: '#FFE4B5',
    borderWidth: 2,
    borderColor: '#FF8C42',
  },
  optionImage: {
    width: '80%',
    height: '80%',
  },
  optionEmoji: {
    fontSize: 30,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFB366',
    paddingVertical: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default MascotCustomization;