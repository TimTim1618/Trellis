import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';


type Group = {
  id: string;
  name: string;
  inviteCode: string;
  members: string[];
};


export default function Home() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Omit<Group, 'id'>
      }));
      setGroups(groupList);
    });

    return unsubscribe;
  }, [user]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (e: any) {
      console.log(e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Groups</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.groupItem} onPress={() => router.push(`/feed/${item.id}` as any)}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.inviteCode}>Invite Code: {item.inviteCode}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>You have no groups yet.</Text>}
      />
      <Button title="Create Group" onPress={() => router.push('/create-group')} />
      <Button title="Join Group" onPress={() => router.push('/join-group')} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#000000' },
  groupItem: { padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10 },
  groupName: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  inviteCode: { fontSize: 14, color: '#666666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#666666', marginTop: 20 },
});