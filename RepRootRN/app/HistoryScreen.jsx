import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function HistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Workout History</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={
          selectedDate
            ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#2d3034',
                  selectedTextColor: '#fff',
                },
              }
            : {}
        }
        theme={{
          todayTextColor: '#2d3034',
          arrowColor: '#2d3034',
        }}
      />
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Workouts for {selectedDate}</Text>
            {/* TODO: Fetch and display real workout data for the selected date */}
            <Text style={styles.placeholder}>No workout data yet.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#f8f9fa' },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#343a40',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#2d3034',
    padding: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 