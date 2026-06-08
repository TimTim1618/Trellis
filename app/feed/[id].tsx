import { router, useLocalSearchParams } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { db } from '../../config/firebase';

type Post = {
  id: string;
  userEmail: string;
  imageUrl: string;
  reflection: string;
  date: string;
};

export default function Feed() {
  const { id } = useLocalSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const q = query(
      collection(db, 'posts'),
      where('groupId', '==', id),
      where('date', '==', today),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data() as Omit<Post, 'id'>
      }));
      setPosts(postList);
    });

    return unsubscribe;
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todays Posts</Text>
      <Button title="Post Today's Reading" onPress={() => router.push(`/group/${id}`)} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postItem}>
            <Text style={styles.email}>{item.userEmail}</Text>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text style={styles.reflection}>{item.reflection}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet today.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#000000' },
  postItem: { marginBottom: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15 },
  email: { fontSize: 14, color: '#666666', marginBottom: 8 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
  reflection: { fontSize: 16, color: '#000000' },
  empty: { textAlign: 'center', color: '#666666', marginTop: 20 },
});