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
  fontWeight,
  spacing,
  radius,
  shadows,
  touchTargetSpec,
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
    backgroundColor: backgroundColors.input,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: borderColors.default,
    backgroundColor: backgroundColors.background,
  },
  closeButton: {
    width: touchTargetSpec.minimum,
    height: touchTargetSpec.minimum,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
  },
  saveButtonContainer: {
    minWidth: touchTargetSpec.minimum,
    minHeight: touchTargetSpec.minimum,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButton: {
    fontSize: 16,
    fontWeight: fontWeight.medium,
    color: textColors.secondary,
  },
  saveButton: {
    color: primaryColors.primary,
    fontWeight: fontWeight.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing(5),
    paddingTop: spacing(5),
  },
  inputGroup: {
    marginBottom: spacing(5),
  },
  label: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
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
