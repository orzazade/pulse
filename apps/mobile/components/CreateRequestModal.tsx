import React, { useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

interface CreateRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRequestModal({
  visible,
  onClose,
  onSuccess,
}: CreateRequestModalProps) {
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRequest = useMutation(api.requests.createRequest);

  const resetForm = () => {
    setBloodType(null);
    setUrgency("normal");
    setCity("");
    setNotes("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!bloodType) {
      Alert.alert("Required", "Please select a blood type.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        bloodType,
        urgency,
        city: city.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert("Success", "Blood request posted successfully!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
            <Text style={[styles.headerButton, isSubmitting && styles.disabled]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Blood Request</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          {/* Blood Type Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Type Needed *</Text>
            <View style={styles.bloodTypeGrid}>
              {BLOOD_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.bloodTypeChip,
                    bloodType === type && styles.bloodTypeChipSelected,
                  ]}
                  onPress={() => setBloodType(type)}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.bloodTypeChipText,
                      bloodType === type && styles.bloodTypeChipTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Urgency Toggle */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Urgency</Text>
            <View style={styles.urgencyContainer}>
              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === "normal" && styles.urgencyButtonSelected,
                ]}
                onPress={() => setUrgency("normal")}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.urgencyButtonText,
                    urgency === "normal" && styles.urgencyButtonTextSelected,
                  ]}
                >
                  Normal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  styles.urgencyButtonUrgent,
                  urgency === "urgent" && styles.urgencyButtonUrgentSelected,
                ]}
                onPress={() => setUrgency("urgent")}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.urgencyButtonText,
                    urgency === "urgent" && styles.urgencyButtonUrgentTextSelected,
                  ]}
                >
                  Urgent
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* City Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City (Optional)</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Enter city where blood is needed"
              placeholderTextColor="#9ca3af"
              editable={!isSubmitting}
            />
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={(text) => setNotes(text.slice(0, 500))}
              placeholder="Additional details..."
              placeholderTextColor="#9ca3af"
              editable={!isSubmitting}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{notes.length}/500</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Post Request</Text>
            )}
          </TouchableOpacity>
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
  headerSpacer: {
    width: 50, // Balance the header layout
  },
  disabled: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bloodTypeChip: {
    width: 70,
    height: 40,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodTypeChipSelected: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  bloodTypeChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  bloodTypeChipTextSelected: {
    color: "white",
  },
  urgencyContainer: {
    flexDirection: "row",
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    height: 44,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  urgencyButtonSelected: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  urgencyButtonUrgent: {
    borderColor: "#fee2e2",
  },
  urgencyButtonUrgentSelected: {
    backgroundColor: "#b91c1c",
    borderColor: "#b91c1c",
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  urgencyButtonTextSelected: {
    color: "white",
  },
  urgencyButtonUrgentTextSelected: {
    color: "white",
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
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#dc2626",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
});
