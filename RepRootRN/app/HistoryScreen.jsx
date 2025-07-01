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
      <View style={styles.calendarCard}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={
            selectedDate
              ? {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: '#fff',
                    selectedTextColor: '#232323',
                  },
                }
              : {}
          }
          theme={{
            backgroundColor: '#232323',
            calendarBackground: '#232323',
            todayTextColor: '#fff',
            arrowColor: '#fff',
            monthTextColor: '#fff',
            dayTextColor: '#fff',
            textDisabledColor: '#555',
            textSectionTitleColor: '#bbb',
            selectedDayBackgroundColor: '#fff',
            selectedDayTextColor: '#232323',
          }}
        />
      </View>
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
  container: { flex: 1, paddingTop: 40, backgroundColor: '#111' },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  calendarCard: {
    backgroundColor: '#232323',
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#232323',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#fff',
  },
  placeholder: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 28,
  },
  closeButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 32,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 