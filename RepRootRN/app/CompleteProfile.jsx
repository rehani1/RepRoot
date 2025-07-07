import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import KeyboardAvoid from './KeyboardAvoid';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function CompleteProfile() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInch, setHeightInch] = useState('');
  const [weight, setWeight] = useState('');
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(false);

  // Keep height in sync with pickers
  useEffect(() => {
    if (heightFeet && heightInch !== '') {
      setHeight(`${heightFeet}'${heightInch}"`);
    }
  }, [heightFeet, heightInch]);

  const handleSubmit = async () => {
    if (!name || !height || !weight || !dob || !gender) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not found.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      height,
      weight: parseInt(weight),
      dob,
      gender,
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseInt(protein) : null,
      carbs: carbs ? parseInt(carbs) : null,
      fat: fat ? parseInt(fat) : null,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to save profile.');
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }} edges={["top"]}>
      <KeyboardAvoid style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#bbb" value={name} onChangeText={setName} />
          <Text style={styles.inputLabel}>Height</Text>
          <View style={styles.heightPickerRow}>
            <Picker
              selectedValue={heightFeet}
              onValueChange={setHeightFeet}
              style={[styles.picker, styles.heightPicker]}
            >
              <Picker.Item label="Feet" value="" />
              {['4', '5', '6', '7'].map((ft) => (
                <Picker.Item key={ft} label={ft} value={ft} />
              ))}
            </Picker>
            <Picker
              selectedValue={heightInch}
              onValueChange={setHeightInch}
              style={[styles.picker, styles.heightPicker]}
            >
              <Picker.Item label="Inches" value="" />
              {Array.from({ length: 12 }, (_, i) => String(i)).map((inch) => (
                <Picker.Item key={inch} label={inch} value={inch} />
              ))}
            </Picker>
          </View>
          <Text style={styles.inputLabel}>Weight (lbs)</Text>
          <TextInput style={styles.input} placeholder="Weight (lbs)" placeholderTextColor="#bbb" value={weight} onChangeText={setWeight} keyboardType="numeric" />
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.dobButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dobButtonText}>
              {dob ? dayjs(dob).format('MMM D, YYYY') : 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob && dayjs(dob).isValid() ? new Date(dob) : new Date(2000, 0, 1)}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate) {
                  setDob(dayjs(selectedDate).format('YYYY-MM-DD'));
                  setShowDatePicker(false);
                } else if (event.type === 'dismissed') {
                  setShowDatePicker(false);
                }
              }}
              maximumDate={new Date()}
            />
          )}
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)}>
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Macro Goals</Text>
          <Text style={styles.inputLabel}>Calories</Text>
          <TextInput style={styles.input} placeholder="Calories" placeholderTextColor="#bbb" value={calories} onChangeText={setCalories} keyboardType="numeric" />
          <Text style={styles.inputLabel}>Protein (g)</Text>
          <TextInput style={styles.input} placeholder="Protein (g)" placeholderTextColor="#bbb" value={protein} onChangeText={setProtein} keyboardType="numeric" />
          <Text style={styles.inputLabel}>Carbs (g)</Text>
          <TextInput style={styles.input} placeholder="Carbs (g)" placeholderTextColor="#bbb" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
          <Text style={styles.inputLabel}>Fat (g)</Text>
          <TextInput style={styles.input} placeholder="Fat (g)" placeholderTextColor="#bbb" value={fat} onChangeText={setFat} keyboardType="numeric" />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoid>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#111',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#bbb',
    fontSize: 15,
    marginBottom: 2,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
  },
  heightPickerRow: {
    flexDirection: 'column',
    marginBottom: 18,
    gap: 6,
  },
  heightPicker: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 2,
  },
  dobButton: {
    backgroundColor: '#232323',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  dobButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: '#6fcf97',
  },
  genderText: {
    color: '#bbb',
    fontWeight: 'bold',
  },
  genderTextActive: {
    color: '#232323',
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: '#232323',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 