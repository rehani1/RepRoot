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
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{user.name}</Text>

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

      <Text style={styles.sectionTitle}>Workouts</Text>
      <View style={styles.sectionBox}>
        <Text style={styles.editLabel}>Workouts Logged: <Text style={styles.bold}>{user.workoutsLogged}</Text></Text>
      </View>

      <Text style={styles.sectionTitle}>Nutrition</Text>
      <View style={styles.sectionBox}>
        <Text style={styles.editLabel}>Calories: <Text style={styles.bold}>{user.calories}</Text></Text>
        <Text>Carbs (C): <Text style={styles.bold}>{user.carbs}g</Text></Text>
        <Text>Protein (P): <Text style={styles.bold}>{user.protein}g</Text></Text>
        <Text>Fat (F): <Text style={styles.bold}>{user.fat}g</Text></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
  },
  value: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 8,
  },
  sectionBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  editLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
