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

    await onAdd({
      donationDate: donationDate.getTime(),
      donationCenter: donationCenter.trim() || undefined,
      notes: notes.trim() || undefined,
    });
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
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={isSaving}>
            <Text style={[styles.headerButton, isSaving && styles.disabled]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Donation</Text>
          <TouchableOpacity onPress={handleAdd} disabled={isSaving}>
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
              placeholderTextColor="#9ca3af"
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this donation"
              placeholderTextColor="#9ca3af"
              editable={!isSaving}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
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
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  headerButton: {
    fontSize: 17,
    color: "#6b7280",
  },
  saveButton: {
    color: "#dc2626",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  notesInput: {
    minHeight: 80,
  },
  dateButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#111827",
  },
  datePicker: {
    backgroundColor: "white",
    borderRadius: 8,
  },
});
