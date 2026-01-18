import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import {
  spacing,
  textColors,
  primaryColors,
  backgroundColors,
  borderColors,
  buttonSpec,
  inputSpec,
  headingStyles,
  fontWeight,
} from '@/theme/tokens';
import { BloodTypeSelector } from './BloodTypeSelector';
import { UnitsStepper } from './UnitsStepper';
import { UrgencySelector } from './UrgencySelector';

type UrgencyLevel = 'critical' | 'urgent' | 'standard';

interface NewRequestScreenProps {
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * New Request Screen
 *
 * Full-screen form for creating a blood request matching CreateBloodRequest.png.
 * Layout: Blood Type Grid -> Units Stepper -> Urgency Radio -> Hospital Input -> Post Button
 */
export function NewRequestScreen({ onClose, onSuccess }: NewRequestScreenProps) {
  const insets = useSafeAreaInsets();
  const createRequest = useMutation(api.requests.createRequest);

  // Form state
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgent');
  const [hospital, setHospital] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const isValid = bloodType !== null;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createRequest({
        bloodType,
        units,
        urgency,
        hospital: hospital.trim() || undefined,
      });

      Alert.alert(
        'Request Posted',
        'Your blood request has been posted. Matching donors will be notified.',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to create request:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to post request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={textColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>New Request</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Blood Type Section */}
        <BloodTypeSelector value={bloodType} onChange={setBloodType} />

        {/* Units Section */}
        <UnitsStepper
          value={units}
          onChange={setUnits}
          min={1}
          max={10}
        />

        {/* Urgency Section */}
        <UrgencySelector value={urgency} onChange={setUrgency} />

        {/* Hospital/Location Section */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Hospital / Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Central Hospital, Baku"
            placeholderTextColor={inputSpec.placeholderColor}
            value={hospital}
            onChangeText={setHospital}
            autoCapitalize="words"
          />
        </View>
      </ScrollView>

      {/* Post Request Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing(4) }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isValid || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={textColors.onPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>Post Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: borderColors.default,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: headingStyles.pageTitle.fontSize,
    fontWeight: headingStyles.pageTitle.fontWeight,
    color: textColors.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(6),
  },
  inputSection: {
    marginBottom: spacing(6),
  },
  label: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: textColors.primary,
    marginBottom: spacing(3),
  },
  input: {
    height: inputSpec.height,
    borderWidth: inputSpec.borderWidth,
    borderColor: inputSpec.borderColor,
    borderRadius: inputSpec.borderRadius,
    backgroundColor: inputSpec.backgroundColor,
    paddingHorizontal: inputSpec.paddingHorizontal,
    fontSize: inputSpec.fontSize,
    color: textColors.primary,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing(5),
    paddingTop: spacing(4),
    backgroundColor: backgroundColors.background,
    borderTopWidth: 1,
    borderTopColor: borderColors.default,
  },
  submitButton: {
    height: buttonSpec.primary.height,
    borderRadius: buttonSpec.primary.borderRadius,
    backgroundColor: buttonSpec.primary.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: buttonSpec.primary.fontSize,
    fontWeight: buttonSpec.primary.fontWeight,
    color: buttonSpec.primary.textColor,
  },
});
