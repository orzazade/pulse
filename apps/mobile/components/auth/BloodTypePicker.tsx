import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  radius,
  textColors,
  borderColors,
  primaryColors,
  bloodTypeChipSpec,
  inputSpec,
} from "@/theme/tokens";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type BloodType = (typeof BLOOD_TYPES)[number];

interface BloodTypePickerProps {
  /** Currently selected blood type */
  value: BloodType | null;
  /** Callback when blood type is selected */
  onSelect: (type: BloodType) => void;
}

/**
 * Blood Type Picker Component for Auth
 *
 * Looks like an input field but opens a modal with a 4x2 grid
 * of blood type chips for selection.
 */
export function BloodTypePicker({ value, onSelect }: BloodTypePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (type: BloodType) => {
    onSelect(type);
    setModalVisible(false);
  };

  return (
    <>
      {/* Input-like trigger */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.inputValue : styles.placeholder}>
          {value || "Select Blood Type"}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={textColors.tertiary}
        />
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Blood Type</Text>

            <View style={styles.grid}>
              {BLOOD_TYPES.map((type) => {
                const isSelected = value === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => handleSelect(type)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Input-like appearance
  input: {
    height: inputSpec.height,
    borderWidth: inputSpec.borderWidth,
    borderColor: inputSpec.borderColor,
    borderRadius: inputSpec.borderRadius,
    backgroundColor: inputSpec.backgroundColor,
    paddingHorizontal: inputSpec.paddingHorizontal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing(4), // 16px
  },
  placeholder: {
    fontSize: inputSpec.fontSize,
    color: inputSpec.placeholderColor,
  },
  inputValue: {
    fontSize: inputSpec.fontSize,
    color: textColors.primary,
    fontWeight: "500",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing(6), // 24px
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: radius.xl, // 16px
    padding: spacing(6), // 24px
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: textColors.primary,
    textAlign: "center",
    marginBottom: spacing(6), // 24px
  },

  // Blood type grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing(3), // 12px
  },
  chip: {
    width: bloodTypeChipSpec.width,
    height: bloodTypeChipSpec.height,
    borderWidth: bloodTypeChipSpec.inactive.borderWidth,
    borderColor: bloodTypeChipSpec.inactive.borderColor,
    borderRadius: bloodTypeChipSpec.borderRadius,
    backgroundColor: bloodTypeChipSpec.inactive.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
  },
  chipSelected: {
    borderWidth: bloodTypeChipSpec.active.borderWidth,
    borderColor: bloodTypeChipSpec.active.borderColor,
    backgroundColor: bloodTypeChipSpec.active.backgroundColor,
  },
  chipText: {
    fontSize: bloodTypeChipSpec.fontSize,
    fontWeight: bloodTypeChipSpec.fontWeight,
    color: bloodTypeChipSpec.inactive.textColor,
  },
  chipTextSelected: {
    color: bloodTypeChipSpec.active.textColor,
  },

  // Cancel button
  cancelButton: {
    marginTop: spacing(6), // 24px
    paddingVertical: spacing(3), // 12px
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: textColors.secondary,
    fontWeight: "500",
  },
});
