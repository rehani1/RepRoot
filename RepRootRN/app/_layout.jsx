// app/_layout.jsx
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomBar from '../components/ui/BottomBar.jsx';
import { supabase } from '../lib/supabase';

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
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ title: 'History', headerBackTitleVisible: true, headerBackTitle: 'Back', headerTintColor: '#2d3034' }} />
      <Stack.Screen name="ProgressScreen" component={ProgressScreen} options={{ title: 'Progress', headerBackTitleVisible: true, headerBackTitle: 'Back', headerTintColor: '#2d3034' }} />
      <Stack.Screen name="MacroTracker" component={MacroTracker} options={{ title: 'Macro Tracker', headerBackTitleVisible: true, headerBackTitle: 'Back', headerTintColor: '#2d3034' }} />
    </Stack.Navigator>
  );
}

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isLoggedIn ? <MainStack /> : <AuthStack />}
    </GestureHandlerRootView>
  );
}