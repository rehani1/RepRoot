import "react-native-url-polyfill/auto";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuickStartWorkout from './QuickStartWorkout.jsx';
import { supabase } from '../lib/supabase';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const FEATURES = [
  {
    key: 'quickstart',
    label: 'Quick Start',
    color: '#6fcf97',
    icon: <Ionicons name="flash" size={32} color="#fff" />,
    onPress: 'quickstart',
  },
  {
    key: 'macros',
    label: 'Track Macros',
    color: '#56ccf2',
    icon: <MaterialCommunityIcons name="food-apple" size={32} color="#fff" />,
    onPress: 'macros',
  },
  {
    key: 'history',
    label: 'History',
    color: '#f2c94c',
    icon: <Ionicons name="time" size={32} color="#fff" />,
    onPress: 'history',
  },
  {
    key: 'progress',
    label: 'Progress',
    color: '#bb6bd9',
    icon: <MaterialCommunityIcons name="trending-up" size={32} color="#fff" />,
    onPress: 'progress',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Timer logic (simple for now)
  React.useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (!timerActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleCardPress = (key) => {
    if (key === 'quickstart') {
      setTimer(0);
      setTimerActive(true);
      setShowWorkoutModal(true);
    } else if (key === 'macros') {
      router.push('/MacroTracker');
    } else if (key === 'history') {
      navigation.navigate('HistoryScreen');
    } else if (key === 'progress') {
      navigation.navigate("ProgressScreen");
    }
  };

  const handleQuickStart = () => {
    setTimer(0);
    setTimerActive(true);
    setShowWorkoutModal(true);
  };

  const handleCloseWorkout = () => {
    setTimerActive(false);
    setShowWorkoutModal(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Text style={styles.appName}>RepRoot</Text>
      <FlatList
        data={FEATURES}
        numColumns={2}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => handleCardPress(item.key)}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrap}>{item.icon}</View>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      {/* Workout Modal */}
      <Modal visible={showWorkoutModal} animationType="slide" onRequestClose={handleCloseWorkout}>
        <QuickStartWorkout
          timer={formatTime(timer)}
          onClose={handleCloseWorkout}
          onSave={async ({ workoutName, exercises }) => {
            // Save workout to Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const date = new Date().toISOString().slice(0, 10);
            const workoutData = {
              user_id: user.id,
              date,
              name: workoutName,
              exercises,
            };
            if (typeof timer === 'number' && !isNaN(timer)) {
              workoutData.duration = timer;
            }
            const { data, error } = await supabase.from('workouts').insert([workoutData]);
            if (error) {
              alert('Failed to log workout: ' + error.message);
            }
            console.log('Workout insert result:', data, error);
            handleCloseWorkout();
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 16,
  },
  appName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    marginLeft: 24,
    letterSpacing: 2,
  },
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    flexBasis: '45%',
    aspectRatio: 1,
    borderRadius: 28,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrap: {
    marginBottom: 12,
  },
  cardLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
    padding: 24,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#fff',
  },
  timer: {
    fontSize: 52,
    fontWeight: 'bold',
    marginBottom: 36,
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#232323',
    padding: 18,
    borderRadius: 32,
    marginTop: 28,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
