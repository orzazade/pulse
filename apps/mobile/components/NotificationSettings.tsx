import {
  View,
  Text,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";

interface SettingItemProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  isUpdating: boolean;
}

function SettingItem({
  label,
  description,
  value,
  onToggle,
  isUpdating,
}: SettingItemProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <View style={styles.switchContainer}>
        {isUpdating ? (
          <ActivityIndicator size="small" color="#dc2626" />
        ) : (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: "#d1d5db", true: "#fca5a5" }}
            thumbColor={value ? "#dc2626" : "#9ca3af"}
            ios_backgroundColor="#d1d5db"
          />
        )}
      </View>
    </View>
  );
}

export function NotificationSettings() {
  const preferences = useQuery(api.users.getNotificationPreferences);
  const updatePreferences = useMutation(api.users.updateNotificationPreferences);

  const [updatingField, setUpdatingField] = useState<string | null>(null);

  const handleToggle = async (
    field: "notifyRequestMatch" | "notifyRequestAccepted" | "notifyEligibility",
    value: boolean
  ) => {
    setUpdatingField(field);
    try {
      await updatePreferences({ [field]: value });
    } catch (error) {
      // Error will be shown in UI through preferences state
      console.error("Failed to update notification preference:", error);
    } finally {
      setUpdatingField(null);
    }
  };

  // Show loading state while preferences are loading
  if (preferences === undefined) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Notification Preferences</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#dc2626" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Preferences</Text>

      <SettingItem
        label="New blood requests"
        description="Get notified when someone needs your blood type"
        value={preferences.notifyRequestMatch}
        onToggle={(value) => handleToggle("notifyRequestMatch", value)}
        isUpdating={updatingField === "notifyRequestMatch"}
      />

      <SettingItem
        label="Request accepted"
        description="Get notified when a donor accepts your request"
        value={preferences.notifyRequestAccepted}
        onToggle={(value) => handleToggle("notifyRequestAccepted", value)}
        isUpdating={updatingField === "notifyRequestAccepted"}
      />

      <SettingItem
        label="Donation eligibility"
        description="Get reminded when you can donate again"
        value={preferences.notifyEligibility}
        onToggle={(value) => handleToggle("notifyEligibility", value)}
        isUpdating={updatingField === "notifyEligibility"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 15,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#6b7280",
  },
  switchContainer: {
    width: 51,
    height: 31,
    justifyContent: "center",
    alignItems: "center",
  },
});
