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
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import KeyboardAvoid from './KeyboardAvoid';
import { useProfile } from './ProfileContext.jsx';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const windowHeight = Dimensions.get('window').height;

export default function ProfileScreen() {
  const { profile, workoutCount, loading, hasLoaded, updateProfile, updateWorkoutCount } = useProfile();
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
  const [tempDob, setTempDob] = useState(null);
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInch, setHeightInch] = useState('');
  const [showFeetPicker, setShowFeetPicker] = useState(false);
  const [showInchPicker, setShowInchPicker] = useState(false);

  const navigation = useNavigation();
  
  // Safety check for navigation
  const safeNavigate = (routeName, params) => {
    try {
      if (navigation && navigation.navigate) {
        // Use setTimeout to avoid navigation conflicts
        setTimeout(() => {
          navigation.navigate(routeName, params);
        }, 100);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile tab focused', { profile, navigation });
    }, [profile, navigation])
  );


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

    // Pre-fill edit fields when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setHeight(profile.height || '');
      setWeight(profile.weight ? String(profile.weight) : '');
      setDob(profile.dob || '');
      setGender(profile.gender || '');
      setCalories(profile.calories ? String(profile.calories) : '');
      setProtein(profile.protein ? String(profile.protein) : '');
      setCarbs(profile.carbs ? String(profile.carbs) : '');
      setFat(profile.fat ? String(profile.fat) : '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not found.');
      setSaving(false);
      return;
    }
    
    const updatedProfile = {
      id: user.id,
      name,
      height,
      weight: weight ? parseInt(weight) : null,
      dob,
      gender,
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseInt(protein) : null,
      carbs: carbs ? parseInt(carbs) : null,
      fat: fat ? parseInt(fat) : null,
    };
    
    const { error } = await supabase.from('profiles').upsert(updatedProfile);
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Failed to save profile.');
      return;
    }
    
    // Update the context with the new profile data
    updateProfile(updatedProfile);
    setEditModal(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  // Helper to calculate age from DOB
  function getAge(dob) {
    if (!dob) return '-';
    const birth = dayjs(dob);
    if (!birth.isValid()) return '-';
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
    try {
      await supabase.auth.signOut();
      // Add a longer delay and check navigation state before navigating
      setTimeout(() => {
        if (navigation && navigation.navigate) {
          navigation.navigate('Login');
        }
      }, 300);
    } catch (error) {
      // Fallback navigation with delay
      setTimeout(() => {
        if (navigation && navigation.navigate) {
          navigation.navigate('Login');
        }
      }, 300);
    }
  };

  if (!hasLoaded) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6fcf97" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={[styles.container, { minHeight: windowHeight }]}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{loading ? '-' : (profile?.name || 'No Name')}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModal(true)}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>{loading ? '-' : (profile?.height || '-')}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>{loading ? '-' : (profile?.weight ? `${profile.weight} lbs` : '-')}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>{loading ? '-' : getAge(profile?.dob)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{loading ? '-' : (profile?.gender || '-')}</Text>
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Workouts</Text>
          <Text style={styles.editLabel}>Workouts Logged: <Text style={styles.bold}>{loading ? '-' : workoutCount}</Text></Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          <Text style={styles.nutritionText}>Calories: <Text style={styles.bold}>{loading ? '-' : (profile?.calories ?? '-')}</Text></Text>
          <Text style={styles.nutritionText}>Carbs (C): <Text style={styles.bold}>{loading ? '-' : (profile?.carbs ?? '-')} {profile?.carbs ? 'g' : ''}</Text></Text>
          <Text style={styles.nutritionText}>Protein (P): <Text style={styles.bold}>{loading ? '-' : (profile?.protein ?? '-')} {profile?.protein ? 'g' : ''}</Text></Text>
          <Text style={styles.nutritionText}>Fat (F): <Text style={styles.bold}>{loading ? '-' : (profile?.fat ?? '-')} {profile?.fat ? 'g' : ''}</Text></Text>
        </View>
        {/* Log Out Button always at the bottom */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Edit Profile Modal */}
      <Modal visible={editModal} animationType="slide" onRequestClose={() => setEditModal(false)}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <KeyboardAvoid style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
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
                onPress={() => {
                  setTempDob(dob && dayjs(dob).isValid() ? dayjs(dob).toDate() : new Date(1990, 0, 1));
                  setShowDatePicker(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dobButtonText}>
                  {dob && dayjs(dob).isValid() ? dayjs(dob).format('MMM D, YYYY') : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={tempDob || new Date(1990, 0, 1)}
                    mode="date"
                    display="inline"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setTempDob(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                  <View style={styles.datePickerButtons}>
                    <TouchableOpacity 
                      style={styles.datePickerButton} 
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.datePickerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.datePickerButton, styles.datePickerButtonConfirm]} 
                      onPress={() => {
                        if (tempDob) {
                          setDob(dayjs(tempDob).format('YYYY-MM-DD'));
                        }
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextConfirm]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
          </KeyboardAvoid>
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
  datePickerContainer: {
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  datePickerButton: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  datePickerButtonConfirm: {
    backgroundColor: '#6fcf97',
  },
  datePickerButtonText: {
    color: '#bbb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  datePickerButtonTextConfirm: {
    color: '#232323',
  },
});
