import { router } from 'expo-router';
import { signOut, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';



export default function Profile() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName ?? '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleUpdateName = async () => {
        try {
            await updateProfile(auth.currentUser!, {
                displayName,
            });
            setSuccess('name Updated Successfully');
            setError('');
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/');
        } catch (e: any) {
            setError(e.message);
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Profile</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.email}>{user?.email}</Text>

            <Text style={styles.label}>Display Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={displayName}
                onChangeText={setDisplayName}
            />
            <Button title="Update Name" onPress={handleUpdateName} />

            {success ? <Text style={styles.success}>{success}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.spacer} />
            <Button title="Logout" color="red" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#ffffff', paddingTop: 60 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#000000' },
    label: { fontSize: 14, color: '#666666', marginBottom: 4 },
    email: { fontSize: 16, color: '#000000', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
    success: { marginTop: 15, textAlign: 'center', color: '#34C759' },
    error: { marginTop: 15, textAlign: 'center', color: 'red' },
    spacer: { flex: 1 },
  });