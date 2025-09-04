import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { JournalEntry } from '@/types';

export default function JournalScreen() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');

  const questions = [
    {
      id: 'q1',
      question: 'Why am I doing this?',
      placeholder: 'What is the real purpose behind this action?',
      value: q1,
      setValue: setQ1,
    },
    {
      id: 'q2',
      question: 'Will it help my top 3?',
      placeholder: 'Does this align with my most important tasks today?',
      value: q2,
      setValue: setQ2,
    },
    {
      id: 'q3',
      question: 'If not, what else?',
      placeholder: 'What would be a better use of my time and energy?',
      value: q3,
      setValue: setQ3,
    },
  ];

  const saveEntry = () => {
    if (!q1.trim() && !q2.trim() && !q3.trim()) {
      Alert.alert('Empty Entry', 'Please answer at least one question before saving.');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      q1: q1.trim(),
      q2: q2.trim(),
      q3: q3.trim(),
    };

    dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: newEntry });
    
    Alert.alert(
      'Entry Saved',
      'Your reflection has been saved. Take a moment to consider your insights.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const clearForm = () => {
    setQ1('');
    setQ2('');
    setQ3('');
  };

  const recentEntries = state.journalEntries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Decision Pause</Text>
        <TouchableOpacity onPress={clearForm}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.introSection}>
          <Ionicons name="pause-circle" size={48} color="#FF9500" />
          <Text style={styles.introTitle}>Take a Moment to Reflect</Text>
          <Text style={styles.introSubtitle}>
            Before making your next move, pause and consider these questions. 
            This practice helps you make more intentional decisions.
          </Text>
        </View>

        <View style={styles.questionsSection}>
          {questions.map((item, index) => (
            <View key={item.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.questionText}>{item.question}</Text>
              </View>
              
              <TextInput
                style={styles.answerInput}
                placeholder={item.placeholder}
                value={item.value}
                onChangeText={item.setValue}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Reflection</Text>
        </TouchableOpacity>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Reflections</Text>
            {recentEntries.map(entry => (
              <View key={entry.id} style={styles.entryCard}>
                <Text style={styles.entryDate}>
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
                
                {entry.q1 && (
                  <View style={styles.entryAnswer}>
                    <Text style={styles.entryQuestion}>Why am I doing this?</Text>
                    <Text style={styles.entryText}>{entry.q1}</Text>
                  </View>
                )}
                
                {entry.q2 && (
                  <View style={styles.entryAnswer}>
                    <Text style={styles.entryQuestion}>Will it help my top 3?</Text>
                    <Text style={styles.entryText}>{entry.q2}</Text>
                  </View>
                )}
                
                {entry.q3 && (
                  <View style={styles.entryAnswer}>
                    <Text style={styles.entryQuestion}>If not, what else?</Text>
                    <Text style={styles.entryText}>{entry.q3}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Reflection Tips</Text>
          
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={16} color="#FF9500" />
            <Text style={styles.tipText}>
              Be honest with yourself. There are no wrong answers.
            </Text>
          </View>
          
          <View style={styles.tip}>
            <Ionicons name="time-outline" size={16} color="#007AFF" />
            <Text style={styles.tipText}>
              Use this when you feel scattered or unsure about your next action.
            </Text>
          </View>
          
          <View style={styles.tip}>
            <Ionicons name="trending-up-outline" size={16} color="#34C759" />
            <Text style={styles.tipText}>
              Regular reflection builds self-awareness and better decision-making.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display Bold',
  },
  clearButton: {
    fontSize: 16,
    color: '#FF3B30',
  },
  content: {
    padding: 20,
  },
  introSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'SF Pro Display Bold',
  },
  introSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  questionsSection: {
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SF Pro Display Bold',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    fontFamily: 'SF Pro Display Bold',
  },
  answerInput: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000000',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'SF Pro Display Bold',
  },
  recentSection: {
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'SF Pro Display Bold',
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  entryAnswer: {
    marginBottom: 12,
  },
  entryQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9500',
    marginBottom: 4,
    fontFamily: 'SF Pro Display Bold',
  },
  entryText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
