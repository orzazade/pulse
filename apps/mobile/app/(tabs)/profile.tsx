import { useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useModeContext } from "../../contexts/ModeContext";
import { EditProfileModal } from "../../components/EditProfileModal";
import { AddDonationModal } from "../../components/AddDonationModal";
import { ProfileScreen, SettingsScreen } from "../../components/profile";
import { primaryColors } from "@/theme/tokens";

export default function ProfileTabScreen() {
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();
  const convexUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const toggleAvailability = useMutation(api.users.toggleAvailability);
  const donationStats = useQuery(api.donations.getDonationStats);
  const donationHistory = useQuery(api.donations.getDonationHistory);
  const eligibilityStatus = useQuery(api.donations.getEligibilityStatus);
  const addDonation = useMutation(api.donations.addDonation);
  const { currentMode } = useModeContext();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddDonationModalVisible, setIsAddDonationModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingDonation, setIsAddingDonation] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isLoading = convexUser === undefined;

  // Get display values
  const displayName = clerkUser?.fullName || clerkUser?.firstName || "Guest User";
  const phone = convexUser?.phone || "Not set";
  const bloodType = convexUser?.bloodType || "?";
  const city = convexUser?.city || "";
  const region = convexUser?.region || "";
  const preferredDonationCenter = convexUser?.preferredDonationCenter || "";

  // Calculate member since date
  const memberSince = convexUser?._creationTime
    ? new Date(convexUser._creationTime).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Jan 2026";

  // Default to true if isAvailable is undefined
  const isAvailable = convexUser?.isAvailable !== false;
  const showAvailabilityToggle = currentMode === "donor" || currentMode === "both";

  // Calculate stats
  const totalDonations = donationStats?.totalDonations ?? 0;
  const livesHelped = totalDonations * 3; // Each donation can help up to 3 lives
  const daysSinceLastDonation = eligibilityStatus?.daysSinceLastDonation ?? 0;

  // Format donations for DonationHistorySection
  const formatDonationDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formattedDonations = (donationHistory?.donations ?? []).slice(0, 5).map((donation) => ({
    id: donation._id,
    type: "Blood Donation",
    location: donation.donationCenter || "Unknown Location",
    date: formatDonationDate(donation.donationDate),
  }));

  const handleAvailabilityToggle = async () => {
    setIsTogglingAvailability(true);
    try {
      await toggleAvailability();
    } catch (error) {
      Alert.alert("Error", "Failed to update availability. Please try again.");
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleSettings = () => {
    setIsSettingsVisible(true);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

  const handleViewAllDonations = () => {
    setIsAddDonationModalVisible(true);
  };

  const handleSaveProfile = async (values: {
    city: string;
    region: string;
    preferredDonationCenter: string;
  }) => {
    setIsSaving(true);
    try {
      await updateProfile({
        city: values.city || undefined,
        region: values.region || undefined,
        preferredDonationCenter: values.preferredDonationCenter || undefined,
      });
      setIsEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDonation = async (values: {
    donationDate: number;
    donationCenter?: string;
    notes?: string;
  }) => {
    setIsAddingDonation(true);
    try {
      await addDonation({
        donationDate: values.donationDate,
        donationCenter: values.donationCenter,
        notes: values.notes,
      });
      setIsAddDonationModalVisible(false);
      Alert.alert("Success", "Donation logged successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to log donation. Please try again.");
    } finally {
      setIsAddingDonation(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColors.primary} />
      </View>
    );
  }

  // Show Settings screen when settings is tapped
  if (isSettingsVisible) {
    return (
      <SettingsScreen
        onBack={() => setIsSettingsVisible(false)}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />
    );
  }

  return (
    <>
      <ProfileScreen
        user={{
          name: displayName,
          phone,
          bloodType,
          memberSince,
          avatarUrl: clerkUser?.imageUrl,
        }}
        stats={{
          donations: totalDonations,
          livesHelped,
          daysSince: daysSinceLastDonation,
        }}
        eligibility={{
          isEligible: eligibilityStatus?.isEligible ?? true,
          daysUntilEligible: eligibilityStatus?.daysUntilEligible ?? 0,
        }}
        availability={{
          isAvailable: showAvailabilityToggle ? isAvailable : true,
        }}
        donations={formattedDonations}
        onEditProfile={handleEditProfile}
        onSettings={handleSettings}
        onToggleAvailability={handleAvailabilityToggle}
        onViewAllDonations={handleViewAllDonations}
        isTogglingAvailability={isTogglingAvailability}
      />

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleSaveProfile}
        initialValues={{
          city,
          region,
          preferredDonationCenter,
        }}
        isSaving={isSaving}
      />

      <AddDonationModal
        visible={isAddDonationModalVisible}
        onClose={() => setIsAddDonationModalVisible(false)}
        onAdd={handleAddDonation}
        isSaving={isAddingDonation}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
