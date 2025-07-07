import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import KeyboardAvoidingViewContainer from './KeyboardAvoid';

export default function QuickStartWorkout({ timer, onClose, onSave }) {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([
    { name: '', sets: [{ weight: '', reps: '', note: '' }] }
  ]);
  const [error, setError] = useState('');

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ weight: '', reps: '', note: '' }] }]);
  };

  const handleRemoveExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleExerciseNameChange = (idx, name) => {
    const updated = [...exercises];
    updated[idx].name = name;
    setExercises(updated);
  };

  // Add set after a specific set, copying its data
  const handleAddSetAfter = (exIdx, setIdx) => {
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      const newSet = { ...sets[setIdx] };
      sets.splice(setIdx + 1, 0, newSet);
      updated[exIdx].sets = sets;
      return updated;
    });
  };

  // Remove a set at a specific index
  const handleRemoveSet = (exIdx, setIdx) => {
    setExercises((prev) => {
      const updated = [...prev];
      if (updated[exIdx].sets.length > 1) {
        updated[exIdx].sets = updated[exIdx].sets.filter((_, i) => i !== setIdx);
      }
      return updated;
    });
  };

  // Add blank set (from Add Set button)
  const handleAddSet = (exIdx) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exIdx].sets.push({ weight: '', reps: '', note: '' });
      return updated;
    });
  };

  const handleSetChange = (exIdx, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const validate = () => {
    if (!exercises.length) return 'Add at least one exercise.';
    for (const ex of exercises) {
      if (!ex.name.trim()) return 'Please enter a name for each exercise.';
      if (!ex.sets.length) return 'Each exercise must have at least one set.';
      for (const set of ex.sets) {
        if (!set.weight || isNaN(Number(set.weight))) return 'All sets must have a weight.';
        if (!set.reps || isNaN(Number(set.reps))) return 'All sets must have reps.';
      }
    }
    return '';
  };

  const handleSave = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    if (onSave) onSave({ workoutName, exercises });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#181818', flex: 1 }]} edges={["top"]}>
      <KeyboardAvoidingViewContainer style={{ flex: 1 }}>
        <Text style={styles.timer}>{timer}</Text>
        <Text style={styles.title}>Log Workout</Text>
        <TextInput
          style={styles.input}
          placeholder="Workout Name (e.g. Leg Day)"
          placeholderTextColor="#bbb"
          value={workoutName}
          onChangeText={setWorkoutName}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {exercises.map((exercise, exIdx) => (
            <View key={exIdx} style={styles.exerciseCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <TextInput
                  style={styles.exerciseInput}
                  placeholder="Exercise Name"
                  placeholderTextColor="#bbb"
                  value={exercise.name}
                  onChangeText={(text) => handleExerciseNameChange(exIdx, text)}
                />
                <TouchableOpacity onPress={() => handleRemoveExercise(exIdx)} style={styles.removeBtn}>
                  <Text style={{ color: '#bbb', fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
              {exercise.sets.map((set, setIdx) => (
                <View key={setIdx} style={styles.setRow}>
                  <Text style={styles.setNum}>{setIdx + 1}</Text>
                  <TextInput
                    style={styles.setInput}
                    placeholder="Weight"
                    placeholderTextColor="#bbb"
                    value={set.weight}
                    onChangeText={(text) => handleSetChange(exIdx, setIdx, 'weight', text)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.setLabel}>lbs</Text>
                  <TextInput
                    style={styles.setInput}
                    placeholder="Reps"
                    placeholderTextColor="#bbb"
                    value={set.reps}
                    onChangeText={(text) => handleSetChange(exIdx, setIdx, 'reps', text)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.setLabel}>reps</Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Add notes..."
                    placeholderTextColor="#bbb"
                    value={set.note}
                    onChangeText={(text) => handleSetChange(exIdx, setIdx, 'note', text)}
                  />
                  {/* Inline set stepper */}
                  <TouchableOpacity onPress={() => handleAddSetAfter(exIdx, setIdx)} style={styles.inlineSetBtn}>
                    <Text style={styles.inlineSetBtnText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveSet(exIdx, setIdx)} style={styles.inlineSetBtn}>
                    <Text style={styles.inlineSetBtnText}>–</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => handleAddSet(exIdx)} style={styles.addSetBtn}>
                <Text style={styles.addSetText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handleAddExercise} style={styles.addExerciseBtn}>
            <Text style={styles.addExerciseText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.footerBtns}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save Workout</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingViewContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 18,
    paddingTop: 32,
  },
  timer: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 8,
    paddingTop: 32,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: '#232323',
    borderRadius: 18,
    padding: 12,
    marginBottom: 18,
  },
  exerciseInput: {
    flex: 1,
    backgroundColor: '#181818',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginRight: 8,
  },
  removeBtn: {
    padding: 4,
    marginLeft: 2,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 6,
  },
  setNum: {
    color: '#bbb',
    fontWeight: 'bold',
    marginRight: 6,
    width: 18,
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
    fontSize: 16,
    minWidth: 70,
  },
  setLabel: {
    color: '#bbb',
    fontSize: 13,
    marginRight: 4,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 6,
    padding: 6,
    marginHorizontal: 4,
    fontSize: 14,
  },
  addSetBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addSetText: {
    color: '#ccc',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addExerciseBtn: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  addExerciseText: {
    color: '#ccc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: '#232323',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: '#bbb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#232323',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#ff4b2b',
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  inlineSetBtn: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  inlineSetBtnText: {
    color: '#ccc',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 