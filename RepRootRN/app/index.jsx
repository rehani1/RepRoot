import "react-native-url-polyfill/auto";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.appName}>RepRoot</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionButton} onPress={handleQuickStart}>
            <Text style={styles.actionButtonText}>Quick Start</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/MacroTracker')}>
            <Text style={styles.actionButtonText}>Track Macros</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.historyCard} onPress={() => navigation.navigate('HistoryScreen')}>
            <Text style={styles.historyIcon}>🕓</Text>
            <Text style={styles.historyLabel}>History</Text>
          </TouchableOpacity>
        </View>
        {/* Workout Modal */}
        <Modal visible={showWorkoutModal} animationType="slide" onRequestClose={handleCloseWorkout}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Workout Session</Text>
            <Text style={styles.timer}>{formatTime(timer)}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseWorkout}>
              <Text style={styles.closeButtonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingHorizontal: 0,
    paddingTop: 16,
  },
  appName: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
    marginLeft: 24,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: '#232323',
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 0,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButton: {
    paddingVertical: 28,
    alignItems: 'center',
    borderRadius: 28,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  historyIcon: {
    fontSize: 24,
    color: '#fff',
    marginRight: 10,
  },
  historyLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
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
