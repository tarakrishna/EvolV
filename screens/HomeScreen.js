import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { StatCard, AddMealForm, RecipeSection } from '../components/common'; // Import reusable components
import { API_BASE_URL } from '../config/api'; // <-- CORRECTED: Import from the new config file

const HomeScreen = ({ token, onLogout }) => {
    const [summary, setSummary] = useState(null);
    const [ingredients, setIngredients] = useState('');
    const [recipe, setRecipe] = useState(null);
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
    const isFocused = useIsFocused();

    const fetchSummary = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/diet/today`, { headers: { 'Authorization': `Bearer ${token}` }});
            if (response.status === 401) { onLogout(); return; }
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail);
            setSummary(data);
        } catch (error) {
            console.error("Failed to fetch summary:", error);
            setSummary({ totals: {}, entries: [] });
        }
    };

    useEffect(() => { if (isFocused) { fetchSummary(); } }, [isFocused, token]);

    const handleAddEntry = async (entry) => {
        try {
            await fetch(`${API_BASE_URL}/diet/add`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            });
            await fetchSummary();
        } catch (error) { Alert.alert("Error", "Failed to add meal."); }
    };

    const handleSuggestRecipe = async () => {
        if (!ingredients.trim()) return;
        setIsLoadingRecipe(true);
        setRecipe(null);
        try {
            const ingredientsList = ingredients.split(',').map(item => item.trim());
            const response = await fetch(`${API_BASE_URL}/recipe/suggest`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: ingredientsList }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail);
            setRecipe(data);
        } catch (error) {
            Alert.alert("Error", `Failed to get recipe: ${error.message}`);
        } finally {
            setIsLoadingRecipe(false);
        }
    };

    if (!summary) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#059669" /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                    <TouchableOpacity onPress={onLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Today's Summary</Text>
                    <View style={styles.statsGrid}>
                        <StatCard label="Calories" value={Math.round(summary?.totals?.calories || 0)} color="#3b82f6" />
                        <StatCard label="Protein" value={`${(summary?.totals?.protein || 0).toFixed(1)}g`} color="#ef4444" />
                        <StatCard label="Carbs" value={`${(summary?.totals?.carbs || 0).toFixed(1)}g`} color="#f97316" />
                        <StatCard label="Fats" value={`${(summary?.totals?.fats || 0).toFixed(1)}g`} color="#eab308" />
                    </View>
                </View>
                <AddMealForm onAddEntry={handleAddEntry} />
                <RecipeSection ingredients={ingredients} onIngredientsChange={setIngredients} onSuggestRecipe={handleSuggestRecipe} isLoading={isLoadingRecipe} recipe={recipe} />
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Today's Log</Text>
                    {summary?.entries?.length > 0 ? (
                        summary.entries.map((entry, index) => (
                            <View key={index} style={styles.logItem}>
                                <Text style={styles.logItemName}>{entry.name}</Text>
                                <Text style={styles.logItemDetails}>{Math.round(entry.calories)} kcal &bull; P:{entry.protein}g C:{entry.carbs}g F:{entry.fats}g</Text>
                            </View>
                        ))
                    ) : (
                        <Text>No entries for today.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' },
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    dashboardContainer: { flex: 1, },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 15, paddingTop: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#047857', marginTop: 10, marginBottom: 10, paddingHorizontal: 15 },
    logoutText: { color: '#059669', fontSize: 16, fontWeight: '600' },
    card: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 15, padding: 15, marginBottom: 20, marginHorizontal: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 15 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    logItem: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    logItemName: { fontWeight: '600' },
    logItemDetails: { fontSize: 12, color: '#6b7280', marginTop: 4 },
});

export default HomeScreen;
