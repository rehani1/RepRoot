// components/ui/BottomBar.jsx

import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomBar({ state, descriptors, navigation }) {
  const getIconName = (routeName) => {
    switch (routeName) {
      case 'index':          
        return 'home-outline';
      case 'AIScreen':       
        return 'chatbubbles-outline';
      case 'ProfileScreen':  
        return 'person-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, idx) => {
        const isFocused = state.index === idx;
        const iconName = getIconName(route.name);
        const color = isFocused ? '#fff' : '#6e6e6e';

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={isFocused ? styles.activeButton : styles.button}
          >
            <Ionicons name={iconName} size={24} color={color} />
            {isFocused && (
              <Text style={styles.label}>
                {descriptors[route.key].options.title ?? route.name}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  button: {
    padding: 12,
    borderRadius: 50,
  },
  activeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d3034',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 48,
  },
  label: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});
