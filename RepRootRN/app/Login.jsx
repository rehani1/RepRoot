import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      setError('');
    }, [])
  );

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>RepRoot</Text>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#111' },
  appName: { fontSize: 40, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8, letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#fff' },
  label: { fontWeight: 'bold', marginBottom: 4, marginLeft: 2, color: '#eee' },
  input: { borderWidth: 0, backgroundColor: '#232323', color: '#fff', borderRadius: 18, padding: 14, marginBottom: 18, fontSize: 16 },
  button: { backgroundColor: '#fff', padding: 16, borderRadius: 32, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#111', fontWeight: 'bold', fontSize: 16 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  linkContainer: { alignItems: 'center', marginTop: 8 },
  link: { color: '#fff', textDecorationLine: 'underline' },
}); 