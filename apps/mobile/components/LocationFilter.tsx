import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LocationFilterProps {
  city: string;
  onCityChange: (city: string) => void;
  cities: string[];
}

export function LocationFilter({
  city,
  onCityChange,
  cities,
}: LocationFilterProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputText, setInputText] = useState(city);

  // Filter cities based on input
  const filteredCities = useMemo(() => {
    if (!inputText.trim() || !cities.length) return [];
    const searchTerm = inputText.toLowerCase();
    return cities
      .filter((c) => c.toLowerCase().includes(searchTerm))
      .slice(0, 5); // Show max 5 suggestions
  }, [inputText, cities]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    setShowSuggestions(true);
    // Only trigger search if input is cleared or a valid city is selected
    if (text === "") {
      onCityChange("");
    }
  };

  const handleSelectCity = (selectedCity: string) => {
    setInputText(selectedCity);
    setShowSuggestions(false);
    onCityChange(selectedCity);
  };

  const handleClear = () => {
    setInputText("");
    setShowSuggestions(false);
    onCityChange("");
  };

  const handleUseMyLocation = () => {
    // Placeholder - actual implementation will use user profile data
    // This will be connected to the user's saved location in the profile
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow tap to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location</Text>

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleBlur}
            placeholder="Search city (e.g., Baku)"
            placeholderTextColor="#9ca3af"
          />
          {inputText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete dropdown */}
        {showSuggestions && filteredCities.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSelectCity(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#6b7280"
                  />
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.useLocationButton}
        onPress={handleUseMyLocation}
        activeOpacity={0.7}
      >
        <Ionicons name="location-outline" size={18} color="#dc2626" />
        <Text style={styles.useLocationText}>Use My Location</Text>
      </TouchableOpacity>
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
  inputWrapper: {
    position: "relative",
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  suggestionText: {
    fontSize: 16,
    color: "#374151",
  },
  useLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  useLocationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#dc2626",
  },
});
