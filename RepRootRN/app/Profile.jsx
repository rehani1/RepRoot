// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const ProfileScreen = () => {
//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Profile Screen</Text>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#f8f8f8',
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#333',
//     },
// });

// export default ProfileScreen;

// app/Profile.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  // Editable fields
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInch, setHeightInch] = useState('');
  const [showFeetPicker, setShowFeetPicker] = useState(false);
  const [showInchPicker, setShowInchPicker] = useState(false);

  const navigation = useNavigation();

  // For DOB picker
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
  const months = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  // Parse DOB for picker defaults
  const [dobYear, setDobYear] = useState(dob ? dob.split('-')[0] : '');
  const [dobMonth, setDobMonth] = useState(dob ? dob.split('-')[1] : '');
  const [dobDay, setDobDay] = useState(dob ? dob.split('-')[2] : '');
  // Keep dob in sync with pickers
  useEffect(() => {
    if (dobYear && dobMonth && dobDay) {
      setDob(`${dobYear}-${dobMonth}-${dobDay}`);
    }
  }, [dobYear, dobMonth, dobDay]);
  useEffect(() => {
    if (dob) {
      setDobYear(dob.split('-')[0]);
      setDobMonth(dob.split('-')[1]);
      setDobDay(dob.split('-')[2]);
    }
  }, [editModal]);

  // Parse height for picker defaults
  useEffect(() => {
    if (editModal && height && height.includes("'")) {
      const [ft, rest] = height.split("'");
      const inch = rest ? rest.replace('"', '').trim() : '';
      setHeightFeet(ft.trim());
      setHeightInch(inch);
    }
  }, [editModal]);
  // Keep height in sync with pickers
  useEffect(() => {
    if (heightFeet && heightInch !== '') {
      setHeight(`${heightFeet}'${heightInch}"`);
    }
  }, [heightFeet, heightInch]);

  // Fetch profile and workout count
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      // Pre-fill edit fields
      if (prof) {
        setName(prof.name || '');
        setHeight(prof.height || '');
        setWeight(prof.weight ? String(prof.weight) : '');
        setDob(prof.dob || '');
        setGender(prof.gender || '');
        setCalories(prof.calories ? String(prof.calories) : '');
        setProtein(prof.protein ? String(prof.protein) : '');
        setCarbs(prof.carbs ? String(prof.carbs) : '');
        setFat(prof.fat ? String(prof.fat) : '');
      }
      // Workout count
      const { count } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setWorkoutCount(count || 0);
      setLoading(false);
    };
    fetchData();
  }, [editModal]);

  const handleSave = async () => {
    if (!name || !height || !weight || !dob || !gender) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not found.');
      setSaving(false);
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
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Failed to save profile.');
      return;
    }
    setEditModal(false);
  };

  // Helper to calculate age from DOB
  function getAge(dob) {
    if (!dob) return 'N/A';
    const birth = dayjs(dob);
    if (!birth.isValid()) return 'N/A';
    const today = dayjs();
    let age = today.year() - birth.year();
    if (
      today.month() < birth.month() ||
      (today.month() === birth.month() && today.date() < birth.date())
    ) {
      age--;
    }
    return age;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}><Text style={{ color: '#fff' }}>Loading...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.name || 'No Name'}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModal(true)}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>{profile?.height || '-'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>{profile?.weight ? `${profile.weight} lbs` : '-'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>{getAge(profile?.dob)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{profile?.gender || '-'}</Text>
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Workouts</Text>
          <Text style={styles.editLabel}>Workouts Logged: <Text style={styles.bold}>{workoutCount}</Text></Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          <Text style={styles.nutritionText}>Calories: <Text style={styles.bold}>{profile?.calories ?? 'N/A'}</Text></Text>
          <Text style={styles.nutritionText}>Carbs (C): <Text style={styles.bold}>{profile?.carbs ?? 'N/A'}{profile?.carbs ? 'g' : ''}</Text></Text>
          <Text style={styles.nutritionText}>Protein (P): <Text style={styles.bold}>{profile?.protein ?? 'N/A'}{profile?.protein ? 'g' : ''}</Text></Text>
          <Text style={styles.nutritionText}>Fat (F): <Text style={styles.bold}>{profile?.fat ?? 'N/A'}{profile?.fat ? 'g' : ''}</Text></Text>
        </View>
        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" onRequestClose={() => setEditModal(false)}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.title}>Edit Profile</Text>
            <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#bbb" value={name} onChangeText={setName} />
            <Text style={styles.inputLabel}>Height</Text>
            <View style={styles.heightPickerRow}>
              <TouchableOpacity
                style={styles.heightButton}
                onPress={() => setShowFeetPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dobButtonText}>{heightFeet ? `${heightFeet} ft` : 'Select Feet'}</Text>
              </TouchableOpacity>
              {showFeetPicker && (
                <Picker
                  selectedValue={heightFeet}
                  onValueChange={(val) => { setHeightFeet(val); setShowFeetPicker(false); }}
                  style={styles.modalPicker}
                >
                  <Picker.Item label="Feet" value="" />
                  {['4', '5', '6', '7'].map((ft) => (
                    <Picker.Item key={ft} label={ft} value={ft} />
                  ))}
                </Picker>
              )}
              <TouchableOpacity
                style={styles.heightButton}
                onPress={() => setShowInchPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dobButtonText}>{heightInch !== '' ? `${heightInch} in` : 'Select Inches'}</Text>
              </TouchableOpacity>
              {showInchPicker && (
                <Picker
                  selectedValue={heightInch}
                  onValueChange={(val) => { setHeightInch(val); setShowInchPicker(false); }}
                  style={styles.modalPicker}
                >
                  <Picker.Item label="Inches" value="" />
                  {Array.from({ length: 12 }, (_, i) => String(i)).map((inch) => (
                    <Picker.Item key={inch} label={inch} value={inch} />
                  ))}
                </Picker>
              )}
            </View>
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
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDob(dayjs(selectedDate).format('YYYY-MM-DD'));
                  }
                }}
                maximumDate={new Date()}
              />
            )}
            <View style={{ height: 16 }} />
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
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    padding: 24,
    backgroundColor: '#111',
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: '#232323',
    borderRadius: 32,
    alignItems: 'center',
    padding: 28,
    marginBottom: 28,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  editBtn: {
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 10,
  },
  editBtnText: {
    color: '#6fcf97',
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 16,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#232323',
    paddingVertical: 22,
    paddingHorizontal: 28,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  label: {
    color: '#bbb',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  value: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
  },
  sectionCard: {
    width: '100%',
    backgroundColor: '#232323',
    padding: 22,
    borderRadius: 28,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  editLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  bold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  nutritionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 2,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
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
  cancelBtn: {
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelText: {
    color: '#bbb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputLabel: {
    color: '#bbb',
    fontSize: 15,
    marginBottom: 2,
    marginLeft: 2,
  },
  picker: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 8,
    height: 44,
  },
  dobPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 6,
  },
  dobPicker: {
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
  heightButton: {
    backgroundColor: '#232323',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  modalPicker: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 10,
    marginBottom: 8,
  },
  logoutBtn: {
    backgroundColor: '#d9534f',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 12,
    width: '100%',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});
