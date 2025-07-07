import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';

export default function HistoryScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [tab, setTab] = useState('Workouts');
  const [workouts, setWorkouts] = useState([]);
  const [macros, setMacros] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Fetch all workout/macro dates for calendar marking
  useFocusEffect(
    React.useCallback(() => {
      const fetchMarkedDates = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Fetch workout dates
        const { data: workoutData } = await supabase
          .from('workouts')
          .select('date')
          .eq('user_id', user.id);
        // Fetch macro dates
        const { data: macroData } = await supabase
          .from('macros')
          .select('date')
          .eq('user_id', user.id);
        // Build markedDates object
        const marks = {};
        (workoutData || []).forEach(w => {
          marks[w.date] = { marked: true, dotColor: '#6fcf97' };
        });
        (macroData || []).forEach(m => {
          if (marks[m.date]) {
            marks[m.date].dotColor = '#f39c12'; // Both: orange dot
          } else {
            marks[m.date] = { marked: true, dotColor: '#f39c12' };
          }
        });
        setMarkedDates(marks);
      };
      fetchMarkedDates();
    }, [])
  );

  // Fetch data for selected date
  useEffect(() => {
    if (!selectedDate) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Workouts
      const { data: workoutData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate);
      setWorkouts(workoutData || []);
      // Macros
      const { data: macroData } = await supabase
        .from('macros')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate);
      setMacros(macroData || []);
      setLoading(false);
    };
    fetchData();
  }, [selectedDate]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setTab('Workouts');
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>History</Text>
      <Text style={styles.todayLabel}>Today: {dayjs().format('YYYY-MM-DD')}</Text>
      {selectedDate && (
        <Text style={styles.selectedDateLabel}>Selected: {selectedDate}</Text>
      )}
      <View style={styles.calendarCard}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            ...(selectedDate ? {
              [selectedDate]: {
                ...(markedDates[selectedDate] || {}),
                selected: true,
                selectedColor: '#fff',
                selectedTextColor: '#232323',
              }
            } : {})
          }}
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
            dotColor: '#6fcf97',
            selectedDotColor: '#232323',
          }}
        />
      </View>
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => setTab('Workouts')} style={[styles.tabBtn, tab === 'Workouts' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, tab === 'Workouts' && styles.tabTextActive]}>Workouts</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTab('Macros')} style={[styles.tabBtn, tab === 'Macros' && styles.tabBtnActive]}>
                <Text style={[styles.tabText, tab === 'Macros' && styles.tabTextActive]}>Macros</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350, width: '100%' }}>
              {loading ? (
                <Text style={styles.placeholder}>Loading...</Text>
              ) : tab === 'Workouts' ? (
                workouts.length ? (
                  workouts.map((w, i) => (
                    <View key={w.id || i} style={styles.dataCard}>
                      <Text style={styles.dataTitle}>
                        {w.name || 'Workout'}
                        {w.duration !== undefined && w.duration !== null ? ` (${formatTime(w.duration)})` : ''}
                      </Text>
                      {w.exercises && w.exercises.map((ex, j) => (
                        <View key={j} style={{ marginBottom: 8 }}>
                          <Text style={styles.exerciseName}>{ex.name}</Text>
                          {ex.sets && ex.sets.map((set, k) => (
                            <Text key={k} style={styles.setRow}>{`Set ${k + 1}: ${set.weight} lbs x ${set.reps} reps${set.note ? ' - ' + set.note : ''}`}</Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={styles.placeholder}>No workout data for this day.</Text>
                )
              ) : (
                macros.length ? (
                  <View style={styles.dataCard}>
                    {macros.map((m, i) => (
                      <View key={m.id || i} style={{ marginBottom: 8 }}>
                        <Text style={styles.exerciseName}>{m.meal || 'Meal'}</Text>
                        <Text style={styles.setRow}>{`${m.food}: P ${m.protein}g, C ${m.carbs}g, F ${m.fats}g, Cal ${m.calories}`}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.placeholder}>No macro data for this day.</Text>
                )
              )}
            </ScrollView>
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
    marginBottom: 8,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  todayLabel: {
    color: '#6fcf97',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  selectedDateLabel: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
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
    textAlign: 'center',
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
  tabRow: {
    flexDirection: 'row',
    marginBottom: 18,
    width: '100%',
    justifyContent: 'center',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#181818',
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#bbb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#232323',
  },
  dataCard: {
    backgroundColor: '#181818',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  dataTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  exerciseName: {
    color: '#6fcf97',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  setRow: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
}); 