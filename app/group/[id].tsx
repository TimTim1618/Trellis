import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';


export default function GroupScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission to access photos is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Permission to access camera is required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!image || !reflection.trim()) {
      setError('Please add a photo and a reflection');
      return;
    }
    setPosting(true);
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const imageRef = ref(storage, `posts/${user?.uid}/${Date.now()}.jpg`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'posts'), {
        groupId: id,
        userId: user?.uid,
        userEmail: user?.email,
        imageUrl,
        reflection,
        createdAt: new Date(),
        date: new Date().toDateString(),
      });

      setImage(null);
      setReflection('');
      router.push(`/feed/${id}`);
    } catch (e: any) {
      setError(e.message);
    }
    setPosting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today Reading</Text>
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.imageButtonText}>Pick a Photo</Text>
        )}
      </TouchableOpacity>
      <Button title="Take Photo" onPress={takePhoto} />
      <TextInput
        style={styles.input}
        placeholder="What did you read today?"
        value={reflection}
        onChangeText={setReflection}
        multiline
        numberOfLines={4}
      />
      <Button title={posting ? 'Posting...' : 'Post'} onPress={handlePost} disabled={posting} />
      <Button title="View Feed" onPress={() => router.push(`/feed/${id}`)} />
      <Button title="View Feed" onPress={() => router.replace('/home')} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#000000' },
  imageButton: { width: '100%', height: 200, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  imageButtonText: { color: '#666666', fontSize: 16 },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5, height: 100, textAlignVertical: 'top' },
  error: { marginTop: 15, textAlign: 'center', color: 'red' },
});