// app/_layout.jsx
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from 'react-native';

import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomBar from '../components/ui/BottomBar.jsx';
import { supabase } from '../lib/supabase';
import { ProfileProvider } from './ProfileContext.jsx';

import HomeScreen from './index.jsx';
import AIScreen from './AI.jsx';
import ProfileScreen from './Profile.jsx';
import LoginScreen from './Login.jsx';
import RegisterScreen from './Register.jsx';
import HistoryScreen from './HistoryScreen.jsx';
import MacroTracker from './MacroTracker.jsx';
import CompleteProfile from './CompleteProfile.jsx';
import ProgressScreen from './Progress.jsx';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomBar {...props} />}
    >
      <Tab.Screen name="index" component={HomeScreen} options={{ title: 'Home' }} />
      
      <Tab.Screen name="AIScreen" component={AIScreen} options={{ title: 'AI' }} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={{ headerShown: false }} />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ title: 'History', headerBackTitleVisible: true, headerBackTitle: 'Back', headerTintColor: '#2d3034' }} />
      <Stack.Screen name="ProgressScreen" component={ProgressScreen} options={{ title: 'Progress', headerBackTitleVisible: true, headerBackTitle: 'Back', headerTintColor: '#2d3034' }} />
      <Stack.Screen name="MacroTracker" component={MacroTracker} options={{ title: 'Macro Tracker', headerBackTitleVisible: true, headerBackTitle: 'Back', headerTintColor: '#2d3034' }} />
    </Stack.Navigator>
  );
}

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [navKey, setNavKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        setIsLoggedIn(!!session);
        if (session) {
          setNeedsProfile(false);
        } else {
          setNeedsProfile(false);
        }
      } catch (e) {
        console.error('Profile check error:', e);
        setNeedsProfile(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setIsLoggedIn(!!session);
        if (session) {
          setNeedsProfile(false);
        } else {
          setNeedsProfile(false);
        }
        setNavKey((k) => k + 1); // Increment navKey on auth change
      } catch (e) {
        console.error('Profile check error:', e);
        setNeedsProfile(false);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProvider>
        {isLoggedIn ? <MainStack key={navKey} initialRouteName="HomeTabs" /> : <AuthStack key={navKey} />}
      </ProfileProvider>
    </GestureHandlerRootView>
  );
}