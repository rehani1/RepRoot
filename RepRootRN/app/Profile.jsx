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
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  // Mock data (can replace once we get the db?)
  const user = {
    name: 'Adam Smith',
    height: `6'2"`,
    weight: 180,
    calories: 2980,
    carbs: 300,
    protein: 200,
    fat: 90,
    workoutsLogged: 12,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>{user.height}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>{user.weight} lbs</Text>
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Workouts</Text>
          <Text style={styles.editLabel}>Workouts Logged: <Text style={styles.bold}>{user.workoutsLogged}</Text></Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          <Text style={styles.editLabel}>Calories: <Text style={styles.bold}>{user.calories}</Text></Text>
          <Text style={styles.nutritionText}>Carbs (C): <Text style={styles.bold}>{user.carbs}g</Text></Text>
          <Text style={styles.nutritionText}>Protein (P): <Text style={styles.bold}>{user.protein}g</Text></Text>
          <Text style={styles.nutritionText}>Fat (F): <Text style={styles.bold}>{user.fat}g</Text></Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#111',
    alignItems: 'center',
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
});

export default ProfileScreen;
