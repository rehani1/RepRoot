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
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Food" value={food} onChangeText={setFood} />
        <TextInput style={styles.input} placeholder="Protein" value={protein} onChangeText={setProtein} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Carbs" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Fats" value={fats} onChangeText={setFats} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" />
      </View>
      <TouchableOpacity style={styles.addButton} onPress={addEntry}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Protein: {macros.protein}g</Text>
        <Text style={styles.summaryText}>Carbs: {macros.carbs}g</Text>
        <Text style={styles.summaryText}>Fats: {macros.fats}g</Text>
        <Text style={styles.summaryText}>Calories: {macros.calories}</Text>
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.entry}>
              <Text style={styles.foodName}>{item.food}</Text>
              <Text style={styles.entryText}>P: {item.protein}g C: {item.carbs}g F: {item.fats}g Cal: {item.calories}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8f9', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 8, marginRight: 8, marginBottom: 8, width: 90 },
  addButton: { backgroundColor: '#2d3034', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryText: { fontSize: 16, fontWeight: 'bold' },
  entry: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  foodName: { fontWeight: 'bold', fontSize: 16 },
  entryText: { fontSize: 14 },
}); 