import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  primaryColors,
  backgroundColors,
  textColors,
  borderColors,
  fontWeight,
  spacing,
  headingStyles,
} from "@/theme/tokens";
import { Input } from "@/components/ui/Input";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: {
    city: string;
    region: string;
    preferredDonationCenter: string;
  }) => void;
  initialValues: {
    city: string;
    region: string;
    preferredDonationCenter: string;
  };
  isSaving?: boolean;
}

export function EditProfileModal({
  visible,
  onClose,
  onSave,
  initialValues,
  isSaving = false,
}: EditProfileModalProps) {
  const [city, setCity] = useState(initialValues.city);
  const [region, setRegion] = useState(initialValues.region);
  const [preferredDonationCenter, setPreferredDonationCenter] = useState(
    initialValues.preferredDonationCenter
  );

  // Reset form when modal opens with new initial values
  useEffect(() => {
    if (visible) {
      setCity(initialValues.city);
      setRegion(initialValues.region);
      setPreferredDonationCenter(initialValues.preferredDonationCenter);
    }
  }, [visible, initialValues]);

  const handleSave = () => {
    onSave({
      city: city.trim(),
      region: region.trim(),
      preferredDonationCenter: preferredDonationCenter.trim(),
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <View style={styles.saveButtonContent}>
              {isSaving ? (
                <ActivityIndicator size="small" color={primaryColors.primary} />
              ) : (
                <Text
                  style={[
                    styles.headerButton,
                    styles.saveButton,
                  ]}
                >
                  Save
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.inputWrapper}>
            <Input
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="Enter your city"
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Input
              label="Region"
              value={region}
              onChangeText={setRegion}
              placeholder="Enter your region"
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Input
              label="Preferred Donation Center"
              value={preferredDonationCenter}
              onChangeText={setPreferredDonationCenter}
              placeholder="Enter preferred donation center"
              editable={!isSaving}
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
    fontSize: headingStyles.cardTitle.fontSize,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: fontWeight.medium,
    color: textColors.secondary,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(1),
  },
  saveButton: {
    color: primaryColors.primary,
    fontWeight: fontWeight.semibold,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(1),
  },
  disabled: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
    padding: spacing(5),
  },
  inputWrapper: {
    marginBottom: spacing(5),
  },
});
