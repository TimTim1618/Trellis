import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Image, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

type Post = {
  id: string;
  userEmail: string;
  imageUrl: string;
  reflection: string;
  date: string;
};

type Group = {
  name: string;
  inviteCode: string;
  members: string[];
};

export default function Feed() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      const groupDoc = await getDoc(doc(db, 'groups', id as string));
      if (groupDoc.exists()) {
        setGroup(groupDoc.data() as Group);
      }
    };
    fetchGroup();
  }, [id]);

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


  const handleShareInvite = async () => {
    await Share.share({
      message: `Join my Bible accountaility group on Trellis! Invite code: ${group?.inviteCode}`,
    });
  }


  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Text style={styles.backButton}>← Groups</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{group?.name ?? 'Feed'}</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuButton}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Post Button */}
      <Button title="Post Today's Reading" onPress={() => router.push(`/group/${id}` as any)} />

      {/* Feed */}
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

      {/* Group Detail Modal */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{group?.name}</Text>
            <Text style={styles.modalLabel}>Invite Code:</Text>
            <Text style={styles.modalInviteCode}>{group?.inviteCode}</Text>
            <Text style={styles.modalLabel}>Members: {group?.members.length}</Text>
            <Button title="Share Invite Code" onPress={handleShareInvite} />
            <View style={styles.modalSpacer} />
            <Button title="Close" onPress={() => setMenuVisible(false)} />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  backButton: { fontSize: 16, color: '#007AFF' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  menuButton: { fontSize: 24, color: '#000000' },
  postItem: { marginBottom: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15 },
  email: { fontSize: 14, color: '#666666', marginBottom: 8 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
  reflection: { fontSize: 16, color: '#000000' },
  empty: { textAlign: 'center', color: '#666666', marginTop: 20 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#ffffff', padding: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#000000' },
  modalLabel: { fontSize: 16, color: '#666666', marginBottom: 5 },
  modalInviteCode: { fontSize: 32, fontWeight: 'bold', color: '#000000', marginBottom: 20, letterSpacing: 4 },
  modalSpacer: { height: 10 },
});