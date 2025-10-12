import React from 'react';
import { View } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export const ParentIcon = ({ size = 40, color = "#000" }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <MaterialCommunityIcons name="human-male-child" size={size} color={color} />
  </View>
);

export const TherapistIcon = ({ size = 40, color = "#000" }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <FontAwesome6 name="user-doctor" size={size} color={color} />
  </View>
);