import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const ProfileScreen = () => (
    <SafeAreaView style={styles.centered}>
        <Text style={styles.placeholderText}>Profile Screen Coming Soon!</Text>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' },
    placeholderText: { fontSize: 18, color: 'gray', fontWeight: '500' },
});

export default ProfileScreen;