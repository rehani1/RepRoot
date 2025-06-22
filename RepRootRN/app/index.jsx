
import React, { useState } from 'react';    
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function HomeScreen() {

    const today = new Date().toISOString().split('T')[0];
    const [currentMonth, setCurrentMonth] = useState(today);
    const [selectedDate, setSelectedDate] = useState(null);
  return (
    <View style={styles.container}>
        <Text style={styles.heading}>RepRoot</Text>
      <Calendar
        current={currentMonth}
        onMonthChange={({ dateString }) => setCurrentMonth(dateString)}
        hideExtraDays
        onDayPress={(day) => setSelectedDate(day.dateString)}
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

      <Text style={styles.selectedText}>
        {selectedDate
          ? `Selected date: ${selectedDate}`
          : 'Tap a date to select it'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    
    safe: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    
    container: {
      flex: 1,
      padding: 0,
      paddingTop: 40,
    },
    heading: {
        fontSize: 32,     
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#343a40',
        textAlign: 'center',
      },
    
    
    calendar: {
      flex: 1,
      width: '100%',
    },
    selectedText: {
      padding: 16,
      textAlign: 'center',
      fontSize: 16,
      color: '#343a40',
    },
  });
