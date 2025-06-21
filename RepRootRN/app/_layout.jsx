// app/_layout.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomBar from '../components/ui/BottomBar.jsx';

import HomeScreen    from './index.jsx';
import AIScreen      from './AI.jsx';
import ProfileScreen from './Profile.jsx';

const Tab = createBottomTabNavigator();

export default function Layout() {
  return (
    <Tab.Navigator
      // no NavigationContainer here—Expo Router has one at the root
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomBar {...props} />}
    >
      <Tab.Screen
        name="index"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="AIScreen"
        component={AIScreen}
        options={{ title: 'AI' }}
      />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
