
import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';


function generateInviteCode() {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
}


export default function CreateGroup() {
    const { user } = useAuth();
    const [groupName, setGroupName] = useState('');
    const [error, setError ] = useState('');

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setError('Please enter a group name');
            return;
        }
        try {
            const inviteCode = generateInviteCode();
            await addDoc(collection(db, 'groups'), {
                name: groupName,
                createdBy: user?.uid,
                members: [user?.uid],
                inviteCode,
                createdAt: new Date()
            });
            router.replace('/home');
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <View style={styles.container}>
          <Text style={styles.title}>Create a Group</Text>
          <TextInput
            style={styles.input}
            placeholder="Group Name"
            value={groupName}
            onChangeText={setGroupName}
          />
          <Button title="Create Group" onPress={handleCreateGroup} />
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





