import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import KeyboardAvoidingViewContainer from './KeyboardAvoid';

export default function ProgressScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);


  const [showModal, setShowModal] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigation = useNavigation();

 
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        setEntries([]);
        return;
      }

      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

 
      const withUrls = await Promise.all(
        (data || []).map(async (entry) => {
          if (!entry.image_path) return entry;
            const { data: pub, error: urlErr } = await supabase.storage
            .from('progress-images')
            .getPublicUrl(entry.image_path);
            if (urlErr) throw urlErr;
            return { ...entry, image_url: pub.publicUrl };
        })
      );
      setEntries(withUrls);
    } catch (err) {
      console.error("Error fetching progress entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );


  const openImagePicker = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please grant camera‑roll access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        setPickedImage({ uri: asset.uri, type: asset.type || "image/jpeg" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetModalState = () => {
    setPickedImage(null);
    setWeight("");
    setNote("");
    setUploading(false);
  };

  async function saveEntry() {
    try {
      setUploading(true);
  
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('No user');
    
       
    const mime = pickedImage.type || 'image/jpeg';

    
    const ext =
        pickedImage.uri.match(/\.([a-zA-Z0-9]+)$/)?.[1] ??
        mime.split('/').pop() ??
        'jpg';

        const storagePath = `${user.id}/${Date.now()}.${ext.toLowerCase()}`;

        
        const file = {
        uri : pickedImage.uri,   
        type: mime,
        name: `${Date.now()}.${ext}`,
        };
     
        const { error: uploadErr } = await supabase.storage
          .from('progress-images')
          .upload(storagePath, file, {       
              contentType: mime,
              upsert: false,
          });
      if (uploadErr) throw uploadErr;
  
      const { error: insertErr } = await supabase
        .from('progress')
        .insert({
          user_id: user.id,             
          weight: weight ? Number(weight) : null,
          image_path: storagePath,
          note: note?.trim() || null,
        });
  
      if (insertErr) throw insertErr;
  
     
      await fetchEntries();      
      setShowModal(false);
      resetModalState();
    } catch (err) {
      console.error('Save entry error', err);
      Alert.alert('Error', err.message || 'Could not save');
    } finally {
      setUploading(false);
    }
  }
  

 
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Progress</Text>


      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6fcf97"
          style={{ marginTop: 40 }}
        />
      ) : entries.length === 0 ? (
        <Text style={styles.placeholder}>
          No progress entries yet. Tap the button below to add your first one!
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18 }}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.card}>
              {entry.image_url ? (
                <Image source={{ uri: entry.image_url }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Text style={styles.placeholder}>No image</Text>
                </View>
              )}
              <View style={styles.overlay}>
                <Text style={styles.weightText}>
                  {entry.weight != null ? `${entry.weight} lbs` : "—"}
                </Text>
                <Text style={styles.dateText}>
                  {entry.created_at
                    ? dayjs(entry.created_at).format("MMM D, YYYY")
                    : ""}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Entry Button */}
      <TouchableOpacity
        style={styles.newEntryBtn}
        onPress={() => setShowModal(true)}
        disabled={uploading}
      >
        <Text style={styles.newEntryText}>+ New Entry</Text>
      </TouchableOpacity>

      {/* ─────────── New-entry Modal ─────────── */}
<Modal
  visible={showModal}
  transparent
  animationType="slide"
  onRequestClose={() => {
    if (!uploading) {
      setShowModal(false);
      resetModalState();
    }
  }}
>
  {/* lifts the card when the keyboard shows (iOS) */}
  <KeyboardAvoidingViewContainer>
    {/* tap anywhere outside the inputs to dismiss the keyboard */}
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* lets the whole card scroll if the keyboard covers the bottom */}
      <ScrollView
        contentContainerStyle={styles.modalContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalHeading}>Add New Progress</Text>

          {/* ── Photo picker ── */}
          <TouchableOpacity
            style={styles.photoPicker}
            onPress={openImagePicker}
            disabled={uploading}
          >
            {pickedImage ? (
              <Image source={{ uri: pickedImage.uri }} style={styles.previewImg} />
            ) : (
              <Text style={styles.photoPickerText}>Tap to choose photo</Text>
            )}
          </TouchableOpacity>

          {/* ── Weight input ── */}
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Weight (lbs)"
            placeholderTextColor="#666"
            value={weight}
            onChangeText={setWeight}
            editable={!uploading}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />

          {/* ── Note input ── */}
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Note (optional)"
            placeholderTextColor="#666"
            value={note}
            onChangeText={setNote}
            multiline
            editable={!uploading}
          />

          {uploading ? (
            <ActivityIndicator
              style={{ marginVertical: 12 }}
              size="large"
              color="#6fcf97"
            />
          ) : (
            <TouchableOpacity style={styles.saveBtn} onPress={saveEntry}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              if (!uploading) {
                setShowModal(false);
                resetModalState();
              }
            }}
          >
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingViewContainer>
</Modal>
    </View>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#111",
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1,
  },
  placeholder: {
    fontSize: 16,
    color: "#bbb",
    textAlign: "center",
    marginTop: 12,
  },
  card: {
    marginBottom: 24,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#181818",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: "100%",
    height: 320,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weightText: {
    color: "#6fcf97",
    fontSize: 20,
    fontWeight: "bold",
  },
  dateText: {
    color: "#fff",
    fontSize: 14,
  },
  newEntryBtn: {
    backgroundColor: "#6fcf97",
    paddingVertical: 16,
    borderRadius: 32,
    marginHorizontal: 40,
    marginBottom: 24,
  },
  newEntryText: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  /* Modal styles */
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#232323",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalHeading: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
  },
  photoPicker: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: "#181818",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  photoPickerText: {
    color: "#bbb",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  input: {
    width: "100%",
    backgroundColor: "#181818",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#6fcf97",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 4,
  },
  saveBtnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeBtn: {
    paddingVertical: 12,
    marginTop: 6,
  },
  closeBtnText: {
    color: "#bbb",
    fontSize: 15,
  },
});
