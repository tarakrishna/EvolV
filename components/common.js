import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const StatCard = ({ label, value, color }) => (
    <View style={styles.statCard}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

export const GoalProgressBar = ({ label, consumed, goal }) => {
    const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
    const progress = Math.min(percentage, 100);
    let color = '#3b82f6';
    if (percentage > 100) color = '#ef4444';
    else if (percentage >= 80) color = '#22c55e';
    return (
        <View style={styles.progressContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={styles.progressText}>{Math.round(consumed)} / {goal} {label !== 'Calories' ? 'g' : 'kcal'}</Text>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

export const AddMealForm = ({ onAddEntry }) => {
    const [name, setName] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [calories, setCalories] = useState('');
    const handleSubmit = () => {
        if(!name || !protein || !carbs || !fats || !calories) { Alert.alert("Missing Fields", "Please fill out all meal details."); return; }
        onAddEntry({ name, protein: parseFloat(protein), carbs: parseFloat(carbs), fats: parseFloat(fats), calories: parseFloat(calories) });
        setName(''); setProtein(''); setCarbs(''); setFats(''); setCalories('');
    };
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Log a Meal</Text>
            <TextInput style={styles.input} placeholder="Food Name" value={name} onChangeText={setName} />
            <View style={styles.macroGrid}>
                <TextInput style={styles.macroInput} placeholder="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" />
                <TextInput style={styles.macroInput} placeholder="Carbs (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
                <TextInput style={styles.macroInput} placeholder="Fats (g)" value={fats} onChangeText={setFats} keyboardType="numeric" />
                <TextInput style={styles.macroInput} placeholder="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}><Text style={styles.buttonText}>Add Entry</Text></TouchableOpacity>
        </View>
    );
};

export const RecipeSection = ({ ingredients, onIngredientsChange, onSuggestRecipe, isLoading, recipe }) => (
    <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recipe Recommender</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Enter ingredients (e.g., chicken, broccoli)" value={ingredients} onChangeText={onIngredientsChange} multiline />
        <TouchableOpacity style={[styles.button, {backgroundColor: '#0ea5e9'}]} onPress={onSuggestRecipe} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Suggest Recipe</Text>}
        </TouchableOpacity>
        {recipe && (
            <View style={styles.recipeResult}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text><Text style={styles.recipeDescription}>{recipe.description}</Text>
                <View style={styles.recipeDetailsContainer}>
                    <View><Text style={styles.recipeSectionHeader}>Ingredients:</Text>{recipe.ingredients.map((item, index) => (<Text key={index} style={styles.recipeListItem}>&bull; {item}</Text>))}</View>
                    <View><Text style={styles.recipeSectionHeader}>Instructions:</Text>{recipe.instructions.map((item, index) => (<Text key={index} style={styles.recipeListItem}>{index + 1}. {item}</Text>))}</View>
                </View>
            </View>
        )}
    </View>
);

// We need a shared stylesheet for these components
const styles = StyleSheet.create({
    card: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 15, padding: 15, marginBottom: 20, marginHorizontal: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 15 },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    statValue: { fontSize: 22, fontWeight: 'bold' },
    statLabel: { fontSize: 14, color: '#4b5563', marginTop: 4 },
    progressContainer: { marginBottom: 12 },
    progressLabel: { fontWeight: '500', color: '#374151' },
    progressText: { fontSize: 12, color: '#6b7280' },
    progressBarBackground: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: 8, borderRadius: 4 },
    input: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#d1d5db' },
    macroGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    macroInput: { width: '48%', marginBottom: 10, backgroundColor: '#f9fafb', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, fontSize: 14, borderWidth: 1, borderColor: '#d1d5db' },
    button: { backgroundColor: '#059669', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    recipeResult: { marginTop: 20, padding: 15, backgroundColor: '#f0fdf4', borderRadius: 10, borderWidth: 1, borderColor: '#a7f3d0' },
    recipeTitle: { fontSize: 18, fontWeight: 'bold', color: '#047857' },
    recipeDescription: { fontSize: 14, color: '#374151', marginTop: 5, marginBottom: 15 },
    recipeDetailsContainer: { marginTop: 10, gap: 10 },
    recipeSectionHeader: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1f2937' },
    recipeListItem: { fontSize: 14, color: '#374151', marginBottom: 5, lineHeight: 20 },
});
