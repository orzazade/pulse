import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import {
  primaryColors,
  backgroundColors,
  textColors,
  borderColors,
  radius,
  spacing,
  iconSpec,
} from "@/theme/tokens";

interface AddDonationModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (values: {
    donationDate: number;
    donationCenter?: string;
    notes?: string;
  }) => Promise<void>;
  isSaving?: boolean;
}

export function AddDonationModal({
  visible,
  onClose,
  onAdd,
  isSaving = false,
}: AddDonationModalProps) {
  const [donationDate, setDonationDate] = useState(new Date());
  const [donationCenter, setDonationCenter] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setDonationDate(new Date());
      setDonationCenter("");
      setNotes("");
      setShowDatePicker(Platform.OS === "ios");
    }
  }, [visible]);

  const handleDateChange = (event: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      // Validate date is not in future
      if (selectedDate > new Date()) {
        Alert.alert("Invalid Date", "Donation date cannot be in the future.");
        return;
      }
      setDonationDate(selectedDate);
    }
  };

  const handleAdd = async () => {
    // Validate date is not in future
    if (donationDate > new Date()) {
      Alert.alert("Invalid Date", "Donation date cannot be in the future.");
      return;
    }

    try {
      await onAdd({
        donationDate: donationDate.getTime(),
        donationCenter: donationCenter.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save donation. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={isSaving ? undefined : onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            disabled={isSaving}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={iconSpec.md} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Donation</Text>
          <TouchableOpacity
            onPress={handleAdd}
            disabled={isSaving}
            style={styles.saveButtonContainer}
          >
            <Text
              style={[
                styles.headerButton,
                styles.saveButton,
                isSaving && styles.disabled,
              ]}
            >
              {isSaving ? "Adding..." : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Donation Date</Text>
            {Platform.OS === "android" && (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isSaving}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(donationDate)}
                </Text>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={donationDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={styles.datePicker}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Donation Center (Optional)</Text>
            <TextInput
              style={styles.input}
              value={donationCenter}
              onChangeText={setDonationCenter}
              placeholder="Enter donation center name"
              placeholderTextColor={textColors.tertiary}
              editable={!isSaving}
              maxLength={200}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this donation"
              placeholderTextColor={textColors.tertiary}
              editable={!isSaving}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.input,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing(4),
    borderBottomWidth: 1,
    borderBottomColor: borderColors.default,
    backgroundColor: backgroundColors.background,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: textColors.primary,
  },
  headerButton: {
    fontSize: 17,
    color: textColors.secondary,
  },
  saveButton: {
    color: primaryColors.primary,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
    padding: spacing(5),
  },
  inputGroup: {
    marginBottom: spacing(5),
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: textColors.primary,
    marginBottom: spacing(2),
  },
  input: {
    backgroundColor: backgroundColors.background,
    borderWidth: 1,
    borderColor: borderColors.default,
    borderRadius: radius.md,
    padding: spacing(3),
    fontSize: 16,
    color: textColors.primary,
  },
  notesInput: {
    minHeight: 80,
  },
  dateButton: {
    backgroundColor: backgroundColors.background,
    borderWidth: 1,
    borderColor: borderColors.default,
    borderRadius: radius.md,
    padding: spacing(3),
  },
  dateButtonText: {
    fontSize: 16,
    color: textColors.primary,
  },
  datePicker: {
    backgroundColor: backgroundColors.background,
    borderRadius: radius.md,
  },
});
