import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';

export default function JoinGroup() {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    try {
      const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('No group found with that invite code');
        return;
      }

      const groupDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: arrayUnion(user?.uid)
      });

      router.replace('/home');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Invite Code"
        value={inviteCode}
        onChangeText={setInviteCode}
        autoCapitalize="characters"
      />
      <Button title="Join Group" onPress={handleJoinGroup} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#000000' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  error: { marginTop: 15, textAlign: 'center', color: 'red' },
});