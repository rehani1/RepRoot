import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function MacroTracker() {
  const [food, setFood] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [calories, setCalories] = useState('');
  const [entries, setEntries] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndEntries = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        Alert.alert('Error', 'Could not get user. Please log in again.');
        setLoading(false);
        return;
      }
      setUserId(user.id);
      fetchEntries(user.id);
    };
    fetchUserAndEntries();
  }, []);

  const fetchEntries = async (uid) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('macros')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (!error) setEntries(data || []);
    setLoading(false);
  };

  const addEntry = async () => {
    if (!food || !protein || !carbs || !fats || !calories) return;
    if (!userId) return;
    const entry = {
      user_id: userId,
      food,
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fats: parseFloat(fats),
      calories: parseFloat(calories),
    };
    const { error } = await supabase.from('macros').insert([entry]);
    if (error) {
      Alert.alert('Error', 'Failed to add entry.');
      return;
    }
    setFood(''); setProtein(''); setCarbs(''); setFats(''); setCalories('');
    fetchEntries(userId);
  };

  const macros = entries.reduce((acc, e) => {
    acc.protein += e.protein;
    acc.carbs += e.carbs;
    acc.fats += e.fats;
    acc.calories += e.calories;
    return acc;
  }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Macro Tracker</Text>
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Food" placeholderTextColor="#bbb" value={food} onChangeText={setFood} />
          <TextInput style={styles.input} placeholder="Protein" placeholderTextColor="#bbb" value={protein} onChangeText={setProtein} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Carbs" placeholderTextColor="#bbb" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Fats" placeholderTextColor="#bbb" value={fats} onChangeText={setFats} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Calories" placeholderTextColor="#bbb" value={calories} onChangeText={setCalories} keyboardType="numeric" />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addEntry}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Protein: <Text style={styles.summaryValue}>{macros.protein}g</Text></Text>
        <Text style={styles.summaryText}>Carbs: <Text style={styles.summaryValue}>{macros.carbs}g</Text></Text>
        <Text style={styles.summaryText}>Fats: <Text style={styles.summaryValue}>{macros.fats}g</Text></Text>
        <Text style={styles.summaryText}>Calories: <Text style={styles.summaryValue}>{macros.calories}</Text></Text>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.entryCard}>
              <Text style={styles.foodName}>{item.food}</Text>
              <Text style={styles.entryText}>P: {item.protein}g  C: {item.carbs}g  F: {item.fats}g  Cal: {item.calories}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 24, color: '#fff', letterSpacing: 1 },
  inputCard: {
    backgroundColor: '#232323',
    borderRadius: 28,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  inputRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  input: { backgroundColor: '#181818', color: '#fff', borderRadius: 18, padding: 14, marginRight: 10, marginBottom: 10, width: 100, fontSize: 16, borderWidth: 0 },
  addButton: { backgroundColor: '#fff', padding: 16, borderRadius: 32, alignItems: 'center', marginBottom: 0, marginTop: 8 },
  addButtonText: { color: '#111', fontWeight: 'bold', fontSize: 18 },
  summaryCard: {
    backgroundColor: '#232323',
    borderRadius: 28,
    padding: 18,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  summaryValue: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  entryCard: {
    backgroundColor: '#232323',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  foodName: { fontWeight: 'bold', fontSize: 18, color: '#fff', marginBottom: 4 },
  entryText: { fontSize: 15, color: '#eee' },
  loadingText: { color: '#bbb', fontSize: 16, textAlign: 'center', marginTop: 20 },
}); 