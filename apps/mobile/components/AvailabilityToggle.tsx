import { View, Text, Switch, StyleSheet, ActivityIndicator } from "react-native";

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export function AvailabilityToggle({
  isAvailable,
  onToggle,
  isLoading = false,
}: AvailabilityToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Available for Requests</Text>
          <Text style={styles.description}>
            {isAvailable
              ? "You'll receive notifications for blood requests"
              : "You won't receive request notifications"}
          </Text>
        </View>
        <View style={styles.switchContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <Switch
              value={isAvailable}
              onValueChange={onToggle}
              trackColor={{ false: "#d1d5db", true: "#fca5a5" }}
              thumbColor={isAvailable ? "#dc2626" : "#9ca3af"}
              ios_backgroundColor="#d1d5db"
            />
          )}
        </View>
      </View>
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
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
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
