import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView,
    ActivityIndicator, Alert, Dimensions, TextInput, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { BarChart, PieChart } from "react-native-chart-kit";
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { GoalProgressBar } from '../components/common';
import { API_BASE_URL } from '../config/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const screenWidth = Dimensions.get("window").width;

const AnalyticsScreen = ({ token }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [profile, setProfile] = useState(null);
    const [todaySummary, setTodaySummary] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [monthOptions, setMonthOptions] = useState([]);
    const [goals, setGoals] = useState({ daily_calories: '', daily_protein: '', daily_carbs: '', daily_fats: ''});
    const [isGoalsVisible, setIsGoalsVisible] = useState(false);
    const isFocused = useIsFocused();

    const fetchData = useCallback(async () => {
        // FIX 2: Set data to null to show loading indicator on every fetch/month change
        setAnalyticsData(null);
        setProfile(null);
        setTodaySummary(null);

        try {
            const [profileRes, todayRes, analyticsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/user/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/diet/today`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/diet/analytics${selectedMonth ? `?month=${selectedMonth}` : ''}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const profileData = await profileRes.json();
            const todayData = await todayRes.json();
            const analyticsData = await analyticsRes.json();
            if (!profileRes.ok || !todayRes.ok || !analyticsRes.ok) throw new Error("Failed to fetch data");
            
            setProfile(profileData);
            setTodaySummary(todayData);
            setAnalyticsData(analyticsData);
            
            setGoals({
                daily_calories: profileData.daily_calories?.toString() || '',
                daily_protein: profileData.daily_protein?.toString() || '',
                daily_carbs: profileData.daily_carbs?.toString() || '',
                daily_fats: profileData.daily_fats?.toString() || '',
            });

            if (profileData.account_created) {
                const start = new Date(profileData.account_created);
                const end = new Date();
                const options = [];
                let current = new Date(start.getFullYear(), start.getMonth(), 1);
                while (current <= end) {
                    const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
                    const label = current.toLocaleString('default', { month: 'long', year: 'numeric' });
                    options.unshift({ label: label, value: monthStr });
                    current.setMonth(current.getMonth() + 1);
                }
                setMonthOptions(options);
            }
        } catch (error) {
            Alert.alert("Error fetching data", error.message);
        }
    }, [token, selectedMonth]);

    useEffect(() => {
        if (isFocused) {
            fetchData();
        }
    }, [isFocused, fetchData]);

    const handleSaveGoals = async () => {
        try {
            const goalsToSave = {
                daily_calories: parseFloat(goals.daily_calories) || null,
                daily_protein: parseFloat(goals.daily_protein) || null,
                daily_carbs: parseFloat(goals.daily_carbs) || null,
                daily_fats: parseFloat(goals.daily_fats) || null
            };
            const response = await fetch(`${API_BASE_URL}/user/goals`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(goalsToSave)
            });
            if (!response.ok) throw new Error("Failed to save goals");
            
            Alert.alert("Success", "Your goals have been updated!");
            // FIX 1: Re-fetch all data to update the UI with the new goals
            fetchData();
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    const toggleGoalsVisibility = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsGoalsVisible(!isGoalsVisible);
    };

    if (!analyticsData || !profile || !todaySummary) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#059669" /></View>;
    }

    const { last_7_days_calories, macro_distribution, monthly_summary } = analyticsData;
    const chartData = selectedMonth && monthly_summary ? monthly_summary : last_7_days_calories;
    const barChartData = {
        labels: chartData.map(d => new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric' })),
        datasets: [{ data: chartData.map(d => d.calories) }]
    };
    const totalMacros = (macro_distribution.protein || 0) + (macro_distribution.carbs || 0) + (macro_distribution.fats || 0);
    const pieChartData = totalMacros > 0 ? [
        { name: "Protein", population: macro_distribution.protein, color: "#ef4444", legendFontColor: "#1f2937", legendFontSize: 14 },
        { name: "Carbs", population: macro_distribution.carbs, color: "#f97316", legendFontColor: "#1f2937", legendFontSize: 14 },
        { name: "Fats", population: macro_distribution.fats, color: "#eab308", legendFontColor: "#1f2937", legendFontSize: 14 },
    ] : [];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.header}><Text style={styles.title}>Analytics & Goals</Text></View>

                {/* UI CHANGE 3: The "Set Goals" card is now at the top */}
                <View style={styles.card}>
                    <TouchableOpacity style={styles.collapsibleHeader} onPress={toggleGoalsVisibility}>
                        <Text style={styles.sectionTitle}>Set Your Daily Goals</Text>
                        <Ionicons name={isGoalsVisible ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#1f2937" />
                    </TouchableOpacity>
                    {isGoalsVisible && (
                        <View style={styles.collapsibleContent}>
                            <View style={styles.macroGrid}>
                                <TextInput style={styles.macroInput} placeholder="Calories (kcal)" value={goals.daily_calories} onChangeText={t => setGoals({...goals, daily_calories: t})} keyboardType="numeric" />
                                <TextInput style={styles.macroInput} placeholder="Protein (g)" value={goals.daily_protein} onChangeText={t => setGoals({...goals, daily_protein: t})} keyboardType="numeric" />
                                <TextInput style={styles.macroInput} placeholder="Carbs (g)" value={goals.daily_carbs} onChangeText={t => setGoals({...goals, daily_carbs: t})} keyboardType="numeric" />
                                <TextInput style={styles.macroInput} placeholder="Fats (g)" value={goals.daily_fats} onChangeText={t => setGoals({...goals, daily_fats: t})} keyboardType="numeric" />
                            </View>
                            <TouchableOpacity style={[styles.button, {backgroundColor: '#0ea5e9', marginTop: 10}]} onPress={handleSaveGoals}>
                                <Text style={styles.buttonText}>Save Goals</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Daily Goal Progress (Today)</Text>
                    <GoalProgressBar label="Calories" consumed={todaySummary.totals.calories} goal={profile.daily_calories || 2000} />
                    <GoalProgressBar label="Protein" consumed={todaySummary.totals.protein} goal={profile.daily_protein || 100} />
                    <GoalProgressBar label="Carbs" consumed={todaySummary.totals.carbs} goal={profile.daily_carbs || 150} />
                    <GoalProgressBar label="Fats" consumed={todaySummary.totals.fats} goal={profile.daily_fats || 50} />
                </View>

                <View style={styles.card}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.sectionTitle}>Calorie Intake</Text>
                        <RNPickerSelect onValueChange={(value) => setSelectedMonth(value)} items={monthOptions} placeholder={{ label: 'Last 7 Days', value: null }} style={pickerSelectStyles} useNativeAndroidPickerStyle={false} />
                    </View>
                    <BarChart data={barChartData} width={screenWidth - 62} height={230} yAxisSuffix=" kcal" chartConfig={chartConfig} fromZero style={styles.chartStyle} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Macro Distribution (Last 7 Days)</Text>
                    {pieChartData.length > 0 ? (
                        <PieChart data={pieChartData} width={screenWidth - 60} height={220} chartConfig={chartConfig} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />
                    ) : (
                        <Text style={styles.placeholderText}>No macro data logged.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const chartConfig = { backgroundGradientFromOpacity: 0, backgroundGradientToOpacity: 0, color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`, strokeWidth: 2, barPercentage: 0.7, useShadowsForDeltas: true };
const pickerSelectStyles = StyleSheet.create({ 
    inputIOS: { fontSize: 14, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, color: 'black', paddingRight: 30, backgroundColor: '#f9fafb' }, 
    inputAndroid: { fontSize: 14, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, color: 'black', paddingRight: 30, backgroundColor: '#f9fafb' } 
});
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' },
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    dashboardContainer: { flex: 1, },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 15, paddingTop: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#047857', marginTop: 10, marginBottom: 10, paddingHorizontal: 15 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 0 },
    button: { backgroundColor: '#059669', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    card: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 15, padding: 15, marginBottom: 20, marginHorizontal: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 5 },
    macroGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    macroInput: { width: '48%', marginBottom: 10, backgroundColor: '#f9fafb', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, fontSize: 14, borderWidth: 1, borderColor: '#d1d5db' },
    placeholderText: { fontSize: 18, color: 'gray', fontWeight: '500', textAlign: 'center', paddingVertical: 20 },
    chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingRight: 5 },
    chartStyle: { borderRadius: 16, paddingRight: 0, marginRight: -10, paddingBottom: 10, paddingTop: 10 },
    progressContainer: { marginBottom: 12 },
    progressLabel: { fontWeight: '500', color: '#374151' },
    progressText: { fontSize: 12, color: '#6b7280' },
    progressBarBackground: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: 8, borderRadius: 4 },
    collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    collapsibleContent: { paddingTop: 15, marginTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
});

export default AnalyticsScreen;

