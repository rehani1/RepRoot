import "react-native-url-polyfill/auto";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

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
    <View style={styles.container}>
      <Text style={styles.appName}>RepRoot</Text>
      <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart}>
        <Text style={styles.quickStartText}>Quick Start</Text>
      </TouchableOpacity>

      {/* Workout Modal */}
      <Modal visible={showWorkoutModal} animationType="slide" onRequestClose={handleCloseWorkout}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Workout Session</Text>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
          {/* TODO: Add workout entry form here */}
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseWorkout}>
            <Text style={styles.closeButtonText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* History Button at the bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('HistoryScreen')}>
          <Text style={styles.historyIcon}>🕓</Text>
          <Text style={styles.historyLabel}>History</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/MacroTracker')}>
        <Text style={styles.buttonText}>Track Macros</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 0,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d3034',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 24,
    marginLeft: 24,
    textAlign: 'left',
    letterSpacing: 2,
  },
  quickStartButton: {
    backgroundColor: '#2d3034',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    marginTop: 16, // extra space below header
  },
  quickStartText: { color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 },
  bottomContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d3034',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  historyIcon: {
    fontSize: 22,
    color: '#fff',
    marginRight: 8,
  },
  historyLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#2d3034',
  },
  closeButton: {
    backgroundColor: '#2d3034',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#2d3034',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    marginTop: 16, // extra space below header
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 },
});
