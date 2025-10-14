import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const MascotCustomization = () => {
  // Define options first
  const bodyOptions = [
    { id: 1, name: 'Koala', image: require('@/assets/images/koala.png') },
    { id: 2, name: 'Kangaroo', image: require('@/assets/images/roo.png') },
  ];

  const [selectedTab, setSelectedTab] = useState('Body');
  const [selectedAccessory, setSelectedAccessory] = useState<{
    id: number, 
    name: string, 
    image: any, 
    overlays: {koala: any, kangaroo: any},
    cost: number,
    unlocked: boolean
  } | null>(null);
  const [selectedBody, setSelectedBody] = useState(bodyOptions[0]); // Default to first body option
  const [coinBalance, setCoinBalance] = useState(120); // Current user coins
  const [unlockedAccessories, setUnlockedAccessories] = useState<number[]>([]); // Track unlocked accessory IDs

  const handleHome = () => {
    router.push('/child-dashboard' as any);
  };

  const handleStats = () => {
    router.push('/(tabs)/child-stats');
  };

  const handleSettings = () => {
    router.push('/child-settings');
  };

  // Helper function to get the correct overlay image based on body type
  const getAccessoryOverlay = () => {
    if (!selectedAccessory) return null;
    
    const bodyType = selectedBody.name.toLowerCase();
    return selectedAccessory.overlays[bodyType as keyof typeof selectedAccessory.overlays] || 
           selectedAccessory.overlays.koala; // fallback to koala version
  };

  // Check if an accessory is unlocked
  const isAccessoryUnlocked = (accessoryId: number) => {
    return unlockedAccessories.includes(accessoryId);
  };

  // Handle accessory purchase
  const purchaseAccessory = (accessory: any) => {
    if (coinBalance >= accessory.cost && !isAccessoryUnlocked(accessory.id)) {
      setCoinBalance(coinBalance - accessory.cost);
      setUnlockedAccessories([...unlockedAccessories, accessory.id]);
      // Auto-select the newly purchased accessory
      setSelectedAccessory({...accessory, unlocked: true});
    }
  };

  // Handle accessory selection (only if unlocked)
  const handleAccessorySelect = (accessory: any) => {
    if (isAccessoryUnlocked(accessory.id)) {
      setSelectedAccessory({...accessory, unlocked: true});
    } else {
      // If locked, attempt to purchase
      purchaseAccessory(accessory);
    }
  };

  const accessoryOptions = [
    { 
      id: 1, 
      name: 'Shirt', 
      cost: 100,
      image: require('@/assets/images/shirt.png'),
      overlays: {
        koala: require('@/assets/images/shirt_koala.png'),
        kangaroo: require('@/assets/images/shirt_roo.png'),
      }
    },
    { 
      id: 2, 
      name: 'Sunglasses', 
      cost: 150,
      image: require('@/assets/images/sunglasses.png'),
      overlays: {
        koala: require('@/assets/images/sunglasses_koala.png'),
        kangaroo: require('@/assets/images/sunglasses_roo.png'),
      }
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wardrobe</Text>
        <View style={styles.starContainer}>
          <MaterialCommunityIcons name="star-circle" size={24} color="#007ae6ff" />
          <Text style={styles.starText}>{coinBalance}</Text>
        </View>
      </View>

      {/* Mascot Display Area */}
      <View style={styles.mascotDisplayArea}>
        <Image 
          source={selectedBody.image}
          style={styles.mascotImage}
          resizeMode="contain"
        />
        {selectedAccessory && (
          <View style={styles.accessoryOverlay}>
            <Image 
              source={getAccessoryOverlay()} 
              style={styles.accessoryImage}
              resizeMode="contain"
            />
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
              <TouchableOpacity 
                key={option.id} 
                style={[
                  styles.optionItem, 
                  selectedBody?.id === option.id && styles.selectedOption
                ]}
                onPress={() => setSelectedBody(option)}
              >
                <Image source={option.image} style={styles.optionImage} resizeMode="contain" />
                <Text style={styles.optionName}>{option.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <>
              {/* Remove accessory option */}
              <TouchableOpacity 
                key="remove" 
                style={[
                  styles.optionItem, 
                  !selectedAccessory && styles.selectedOption // Selected when no accessory is chosen
                ]}
                onPress={() => setSelectedAccessory(null)}
              >
                <MaterialIcons name="highlight-remove" size={24} color="black" />
                <Text style={styles.optionName}>Remove</Text>
              </TouchableOpacity>
              
              {/* Regular accessory options */}
              {accessoryOptions.map((option) => {
                const isUnlocked = isAccessoryUnlocked(option.id);
                const canAfford = coinBalance >= option.cost;
                
                return (
                  <TouchableOpacity 
                    key={option.id} 
                    style={[
                      styles.optionItem, 
                      selectedAccessory?.id === option.id && styles.selectedOption,
                      !isUnlocked && !canAfford && styles.lockedUnaffordableItem
                    ]}
                    onPress={() => handleAccessorySelect(option)}
                  >
                    <View style={styles.accessoryItemContainer}>
                      <Image source={option.image} style={styles.optionImage} resizeMode="contain" />
                      
                      {/* Lock overlay for locked items */}
                      {!isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <MaterialIcons name="lock" size={20} color="white" />
                          <Text style={styles.costText}>{option.cost}</Text>
                          <MaterialCommunityIcons name="star-circle" size={16} color="#FFD700" />
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.optionName,
                      !isUnlocked && !canAfford && styles.lockedText
                    ]}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={handleHome}>
          <FontAwesome6 name="house-chimney-window" size={40} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleStats}>
          <FontAwesome5 name="trophy" size={40} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons name="koala" size={60} color="#FFD700" />
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
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginLeft: 90,
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
    width: 300,
    height: 300,
  },
  accessoryOverlay: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
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
  optionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  accessoryImage: {
    width: '100%',
    height: '100%',
  },
  accessoryItemContainer: {
    position: 'relative',
    width: '80%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  costText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockedUnaffordableItem: {
    opacity: 0.5,
  },
  lockedText: {
    color: '#999',
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
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  starText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
});

export default MascotCustomization;