import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import the new screen components from their separate files
import HomeScreen from './src/screens/HomeScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
// Import the API URL from its new central location
import { API_BASE_URL } from './src/config/api';

// --- Helper & Auth Components ---
const parseApiError = (error) => {
    if (error && error.detail) {
        if (Array.isArray(error.detail)) { return error.detail.map(err => `${err.loc[1]}: ${err.msg}`).join('\n'); }
        return error.detail;
    }
    return error.message || "An unknown error occurred.";
};

const AuthView = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('john@example.com');
    const [password, setPassword] = useState('mypassword');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleLogin = async () => { setError(''); setIsLoading(true); try { const response = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), }); const data = await response.json(); if (!response.ok) throw data; onLoginSuccess(data.access_token); } catch (err) { setError(parseApiError(err)); } finally { setIsLoading(false); } };
    const handleRegister = async () => { setError(''); setIsLoading(true); try { const response = await fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }), }); const data = await response.json(); if (!response.ok) throw data; Alert.alert('Success', 'Registration successful! Please log in.'); setIsLogin(true); } catch (err) { setError(parseApiError(err)); } finally { setIsLoading(false); } };
    
    return (
        <SafeAreaView style={authStyles.container}>
            <View style={authStyles.authContainer}>
                <Text style={authStyles.title}>Diet Tracker</Text>
                <View style={authStyles.tabContainer}><TouchableOpacity onPress={() => setIsLogin(true)} style={[authStyles.tab, isLogin && authStyles.activeTab]}><Text style={[authStyles.tabText, isLogin && authStyles.activeTabText]}>Login</Text></TouchableOpacity><TouchableOpacity onPress={() => setIsLogin(false)} style={[authStyles.tab, !isLogin && authStyles.activeTab]}><Text style={[authStyles.tabText, !isLogin && authStyles.activeTabText]}>Register</Text></TouchableOpacity></View>
                {!isLogin && (<TextInput style={authStyles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />)}
                <TextInput style={authStyles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={authStyles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity style={authStyles.button} onPress={isLogin ? handleLogin : handleRegister} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#fff" /> : <Text style={authStyles.buttonText}>{isLogin ? 'Login' : 'Create Account'}</Text>}</TouchableOpacity>
                {error ? <Text style={authStyles.errorText}>{error}</Text> : null}
            </View>
        </SafeAreaView>
    );
};

// --- Navigation Setup ---
const Tab = createBottomTabNavigator();

const AppTabs = ({ token, onLogout }) => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'Analytics') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#059669',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 10, shadowOpacity: 0.1 }
        })}
    >
        <Tab.Screen name="Home">{props => <HomeScreen {...props} token={token} onLogout={onLogout} />}</Tab.Screen>
        <Tab.Screen name="Analytics">{props => <AnalyticsScreen {...props} token={token} />}</Tab.Screen>
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);


// Main App Component
export default function App() {
    const [token, setToken] = useState(null);
    const [isLoadingToken, setIsLoadingToken] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('dietAuthToken');
                setToken(storedToken);
            } catch (e) { console.error("Failed to load token", e); } 
            finally { setIsLoadingToken(false); }
        };
        loadToken();
    }, []);

    const handleLoginSuccess = async (newToken) => { try { await AsyncStorage.setItem('dietAuthToken', newToken); setToken(newToken); } catch (e) { console.error("Failed to save token", e); } };
    const handleLogout = async () => { try { await AsyncStorage.removeItem('dietAuthToken'); setToken(null); } catch (e) { console.error("Failed to remove token", e); } };

    if (isLoadingToken) {
        return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                {token ? (<AppTabs token={token} onLogout={handleLogout} />) : (<AuthView onLoginSuccess={handleLoginSuccess} />)}
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

// Minimal styles needed for the root App and Auth components
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' },
});

const authStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    authContainer: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#047857', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#d1d5db' },
    button: { backgroundColor: '#059669', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#e5e7eb', borderRadius: 10 },
    tab: { flex: 1, padding: 12, alignItems: 'center' },
    activeTab: { backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
    tabText: { fontSize: 16, fontWeight: '600', color: '#4b5563' },
    activeTabText: { color: '#059669' },
    errorText: { color: '#dc2626', textAlign: 'center', marginTop: 15 },
});

