import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { bloodTypeChipSpec } from "@/theme/tokens";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

interface BloodTypePickerProps {
  selectedType: string | null;
  onSelect: (type: string | null) => void;
  label?: string;
}

export function BloodTypePicker({
  selectedType,
  onSelect,
  label = "Blood Type Needed",
}: BloodTypePickerProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.grid}>
        {/* All Types option */}
        <TouchableOpacity
          style={[
            styles.chip,
            styles.allTypesChip,
            selectedType === null && styles.selectedChip,
          ]}
          onPress={() => onSelect(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              selectedType === null && styles.selectedChipText,
            ]}
          >
            All Types
          </Text>
        </TouchableOpacity>

        {/* Blood type chips */}
        {BLOOD_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              selectedType === type && styles.selectedChip,
            ]}
            onPress={() => onSelect(type)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                selectedType === type && styles.selectedChipText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    width: bloodTypeChipSpec.width,
    height: bloodTypeChipSpec.height,
    backgroundColor: bloodTypeChipSpec.inactive.backgroundColor,
    borderWidth: bloodTypeChipSpec.inactive.borderWidth,
    borderColor: bloodTypeChipSpec.inactive.borderColor,
    borderRadius: bloodTypeChipSpec.borderRadius,
    justifyContent: "center",
    alignItems: "center",
  },
  allTypesChip: {
    width: 86,
  },
  selectedChip: {
    backgroundColor: bloodTypeChipSpec.active.backgroundColor,
    borderColor: bloodTypeChipSpec.active.borderColor,
    borderWidth: bloodTypeChipSpec.active.borderWidth,
  },
  chipText: {
    fontSize: bloodTypeChipSpec.fontSize,
    fontWeight: bloodTypeChipSpec.fontWeight,
    color: bloodTypeChipSpec.inactive.textColor,
  },
  selectedChipText: {
    color: bloodTypeChipSpec.active.textColor,
  },
});
