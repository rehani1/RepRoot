import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';
import { useProfile } from './ProfileContext.jsx';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Misc'];
const ACCENT = '#ccc'; // light gray accent

export default function MacroTracker() {
  const { profile } = useProfile();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]); // All entries for the selected date
  const [showModal, setShowModal] = useState(false);
  const [modalMeal, setModalMeal] = useState('Breakfast');
  const [food, setFood] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [calories, setCalories] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchUserAndEntries = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        Alert.alert('Error', 'Could not get user. Please log in again.');
        setLoading(false);
        return;
      }
      setUserId(user.id);
      fetchEntries(user.id, selectedDate);
    };
    fetchUserAndEntries();
  }, [selectedDate]);

  const fetchEntries = async (uid, date) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('macros')
      .select('*')
      .eq('user_id', uid)
      .eq('date', date)
      .order('created_at', { ascending: true });
    if (!error) setEntries(data || []);
    setLoading(false);
  };

  const openAddFoodModal = (meal) => {
    setModalMeal(meal);
    setFood(''); setProtein(''); setCarbs(''); setFats(''); setCalories(''); setEditId(null);
    setShowModal(true);
  };

  const openEditFoodModal = (entry) => {
    setModalMeal(entry.meal);
    setFood(entry.food);
    setProtein(entry.protein.toString());
    setCarbs(entry.carbs.toString());
    setFats(entry.fats.toString());
    setCalories(entry.calories.toString());
    setEditId(entry.id);
    setShowModal(true);
  };

  const handleAddOrEditFood = async () => {
    if (!food) {
      Alert.alert('Error', 'Please enter a food name.');
      return;
    }
    if (!userId) return;
    const entry = {
      user_id: userId,
      food,
      protein: protein ? parseFloat(protein) : 0,
      carbs: carbs ? parseFloat(carbs) : 0,
      fats: fats ? parseFloat(fats) : 0,
      calories: calories ? parseFloat(calories) : 0,
      meal: modalMeal,
      date: selectedDate,
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from('macros').update(entry).eq('id', editId));
    } else {
      ({ error } = await supabase.from('macros').insert([entry]));
    }
    if (error) {
      Alert.alert('Error', 'Failed to save entry.');
      return;
    }
    setShowModal(false);
    setEditId(null);
    fetchEntries(userId, selectedDate);
  };

  const handleDeleteFood = async (id) => {
    const { error } = await supabase.from('macros').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', 'Failed to delete entry.');
      return;
    }
    fetchEntries(userId, selectedDate);
  };

  const changeDay = (direction) => {
    const newDate = dayjs(selectedDate).add(direction, 'day').format('YYYY-MM-DD');
    setSelectedDate(newDate);
  };

  // Group entries by meal
  const mealEntries = MEALS.reduce((acc, meal) => {
    acc[meal] = entries.filter(e => e.meal === meal);
    return acc;
  }, {});

  // Calculate daily macros
  const macros = entries.reduce((acc, e) => {
    acc.protein += e.protein;
    acc.carbs += e.carbs;
    acc.fats += e.fats;
    acc.calories += e.calories;
    return acc;
  }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

  // Use profile goals if available, otherwise fallback to defaults for each macro
  const dailyGoals = {
    calories: profile && !isNaN(Number(profile.calories)) && profile.calories !== null && profile.calories !== '' ? Number(profile.calories) : null,
    protein: profile && !isNaN(Number(profile.protein)) && profile.protein !== null && profile.protein !== '' ? Number(profile.protein) : null,
    fat: profile && !isNaN(Number(profile.fat)) && profile.fat !== null && profile.fat !== '' ? Number(profile.fat) : null,
    carbs: profile && !isNaN(Number(profile.carbs)) && profile.carbs !== null && profile.carbs !== '' ? Number(profile.carbs) : null,
  };

  const isToday = selectedDate === dayjs().format('YYYY-MM-DD');
  const displayDate = isToday
    ? `Today${', ' + dayjs(selectedDate).format('MMM D')}`
    : dayjs(selectedDate).format('dddd, MMM D');

  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 0 }}>
      {/* Header and Date Navigation */}
      <View style={{ paddingTop: 24, paddingBottom: 8, backgroundColor: '#111', alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>My Diet Plan</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <TouchableOpacity onPress={() => changeDay(-1)} style={{ padding: 6 }}>
            <Text style={{ color: '#fff', fontSize: 22 }}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 16, marginHorizontal: 12 }}>{displayDate}</Text>
          <TouchableOpacity onPress={() => changeDay(1)} style={{ padding: 6 }}>
            <Text style={{ color: '#fff', fontSize: 22 }}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Daily Summary */}
      <View style={{ backgroundColor: '#232323', borderRadius: 20, marginHorizontal: 12, marginTop: 8, marginBottom: 12, padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Daily Summary</Text>
            <Text style={{ color: '#bbb', fontSize: 13 }}>Today, {dayjs(selectedDate).format('MMMM D')}</Text>
          </View>
          <View style={{ backgroundColor: '#111', borderRadius: 32, padding: 10, borderWidth: 2, borderColor: '#6fcf97', alignItems: 'center' }}>
            <Text style={{ color: '#6fcf97', fontWeight: 'bold', fontSize: 18 }}>{dailyGoals.calories - macros.calories}</Text>
            <Text style={{ color: '#bbb', fontSize: 11 }}>left</Text>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Macros Progress</Text>
          <Text style={{ color: '#bbb', fontSize: 13 }}>Calories  {macros.calories} / {dailyGoals.calories !== null ? dailyGoals.calories + ' cal' : 'N/A'}</Text>
          <View style={{ height: 5, backgroundColor: '#333', borderRadius: 3, marginVertical: 2 }}>
            <View style={{ width: dailyGoals.calories ? `${Math.min(100, (macros.calories/dailyGoals.calories)*100)}%` : '0%', height: 5, backgroundColor: dailyGoals.calories ? '#6fcf97' : '#555', borderRadius: 3 }} />
          </View>
          <Text style={{ color: '#bbb', fontSize: 13 }}>Protein  {macros.protein} / {dailyGoals.protein !== null ? dailyGoals.protein + ' g' : 'N/A'}</Text>
          <View style={{ height: 5, backgroundColor: '#333', borderRadius: 3, marginVertical: 2 }}>
            <View style={{ width: dailyGoals.protein ? `${Math.min(100, (macros.protein/dailyGoals.protein)*100)}%` : '0%', height: 5, backgroundColor: dailyGoals.protein ? ACCENT : '#555', borderRadius: 3 }} />
          </View>
          <Text style={{ color: '#bbb', fontSize: 13 }}>Fat  {macros.fats} / {dailyGoals.fat !== null ? dailyGoals.fat + ' g' : 'N/A'}</Text>
          <View style={{ height: 5, backgroundColor: '#333', borderRadius: 3, marginVertical: 2 }}>
            <View style={{ width: dailyGoals.fat ? `${Math.min(100, (macros.fats/dailyGoals.fats)*100)}%` : '0%', height: 5, backgroundColor: dailyGoals.fat ? ACCENT : '#555', borderRadius: 3 }} />
          </View>
          <Text style={{ color: '#bbb', fontSize: 13 }}>Carbs  {macros.carbs} / {dailyGoals.carbs !== null ? dailyGoals.carbs + ' g' : 'N/A'}</Text>
          <View style={{ height: 5, backgroundColor: '#333', borderRadius: 3, marginVertical: 2 }}>
            <View style={{ width: dailyGoals.carbs ? `${Math.min(100, (macros.carbs/dailyGoals.carbs)*100)}%` : '0%', height: 5, backgroundColor: dailyGoals.carbs ? ACCENT : '#555', borderRadius: 3 }} />
          </View>
        </View>
        <View style={{ marginTop: 8, backgroundColor: '#1a1a1a', borderRadius: 10, padding: 8 }}>
          <Text style={{ color: ACCENT, fontWeight: 'bold' }}>Your goal: Build Muscle</Text>
        </View>
      </View>
      {/* Meals */}
      <FlatList
        data={MEALS}
        keyExtractor={item => item}
        renderItem={({ item: meal }) => (
          <View style={{ backgroundColor: '#232323', borderRadius: 16, marginHorizontal: 12, marginBottom: 12, padding: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{meal}</Text>
              <TouchableOpacity onPress={() => openAddFoodModal(meal)}>
                <Text style={{ color: ACCENT, fontSize: 24, fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>
            </View>
            {mealEntries[meal].length === 0 ? (
              <TouchableOpacity onPress={() => openAddFoodModal(meal)} style={{ borderWidth: 1, borderColor: ACCENT, borderStyle: 'dashed', borderRadius: 10, marginTop: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: ACCENT, fontWeight: 'bold', fontSize: 14 }}>+ Add Food</Text>
              </TouchableOpacity>
            ) : (
              mealEntries[meal].map(entry => (
                <View key={entry.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#181818', borderRadius: 10, marginTop: 8, padding: 10 }}>
                  <View>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{entry.food}</Text>
                    <Text style={{ color: '#bbb', fontSize: 12 }}>P: {entry.protein}g  C: {entry.carbs}g  F: {entry.fats}g  Cal: {entry.calories}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => openEditFoodModal(entry)} style={{ marginRight: 10 }}>
                      <Text style={{ color: '#6fcf97', fontSize: 15 }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteFood(entry.id)}>
                      <Text style={{ color: '#ff4b2b', fontSize: 15 }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
      {/* Add/Edit Food Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#232323', borderRadius: 20, padding: 18, width: '90%' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{editId ? 'Edit Food' : `Add Food to ${modalMeal}`}</Text>
            <TextInput style={{ backgroundColor: '#181818', color: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 }} placeholder="Food" placeholderTextColor="#bbb" value={food} onChangeText={setFood} />
            <TextInput style={{ backgroundColor: '#181818', color: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 }} placeholder="Protein (g)" placeholderTextColor="#bbb" value={protein} onChangeText={setProtein} keyboardType="numeric" />
            <TextInput style={{ backgroundColor: '#181818', color: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 }} placeholder="Carbs (g)" placeholderTextColor="#bbb" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
            <TextInput style={{ backgroundColor: '#181818', color: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 }} placeholder="Fats (g)" placeholderTextColor="#bbb" value={fats} onChangeText={setFats} keyboardType="numeric" />
            <TextInput style={{ backgroundColor: '#181818', color: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 }} placeholder="Calories" placeholderTextColor="#bbb" value={calories} onChangeText={setCalories} keyboardType="numeric" />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}>
                <Text style={{ color: '#bbb', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddOrEditFood}>
                <Text style={{ color: ACCENT, fontWeight: 'bold', fontSize: 14 }}>{editId ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 