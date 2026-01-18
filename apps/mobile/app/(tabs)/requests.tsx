import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { RequestCard } from "../../components/RequestCard";
import { RequestDetailModal } from "../../components/RequestDetailModal";
import { NewRequestScreen } from "../../components/requests/NewRequestScreen";
import {
  primaryColors,
  textColors,
  backgroundColors,
  borderColors,
  spacing,
  shadows,
  fontWeight,
} from "@/theme/tokens";

type TabType = "my-requests" | "incoming";

export default function RequestsScreen() {
  const user = useQuery(api.users.getCurrentUser);
  const myRequests = useQuery(api.requests.getMyRequests);
  const incomingRequests = useQuery(api.requests.getIncomingRequests);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("my-requests");
  const [selectedRequestId, setSelectedRequestId] = useState<Id<"requests"> | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const isLoading = user === undefined;
  const userMode = user?.mode;

  // Determine which views to show based on mode
  const showSeekerView = userMode === "seeker" || userMode === "both";
  const showDonorView = userMode === "donor" || userMode === "both";
  const showTabs = userMode === "both";

  const handleRequestPress = (requestId: Id<"requests">) => {
    setSelectedRequestId(requestId);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequestId(null);
  };

  const handleCreateSuccess = () => {
    // Convex reactivity will handle refresh
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={primaryColors.primary} />
      </View>
    );
  }

  // Render seeker view (My Requests)
  const renderSeekerView = () => {
    const isLoadingRequests = myRequests === undefined;

    if (isLoadingRequests) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColors.primary} />
        </View>
      );
    }

    if (!myRequests || myRequests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={textColors.tertiary} />
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptySubtitle}>
            Create one to find donors.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={myRequests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            variant="seeker"
            onPress={() => handleRequestPress(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // Render donor view (Incoming Requests)
  const renderDonorView = () => {
    const isLoadingRequests = incomingRequests === undefined;

    if (isLoadingRequests) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColors.primary} />
        </View>
      );
    }

    if (!incomingRequests || incomingRequests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={48} color={textColors.tertiary} />
          <Text style={styles.emptyTitle}>No matching requests</Text>
          <Text style={styles.emptySubtitle}>
            No one needs your blood type right now.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={incomingRequests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            variant="donor"
            onPress={() => handleRequestPress(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // New Request Full-Screen Modal
  const renderNewRequestModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <NewRequestScreen
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </Modal>
  );

  // For "both" mode: render tabs
  if (showTabs) {
    return (
      <View style={styles.container}>
        {/* Tab Header */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "my-requests" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("my-requests")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "my-requests" && styles.tabTextActive,
              ]}
            >
              My Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "incoming" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("incoming")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "incoming" && styles.tabTextActive,
              ]}
            >
              Incoming
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === "my-requests" ? renderSeekerView() : renderDonorView()}
        </View>

        {/* FAB for creating requests (only in My Requests tab) */}
        {activeTab === "my-requests" && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color={textColors.onPrimary} />
          </TouchableOpacity>
        )}

        {renderNewRequestModal()}

        <RequestDetailModal
          visible={showDetailModal}
          requestId={selectedRequestId}
          onClose={handleCloseDetailModal}
        />
      </View>
    );
  }

  // For seeker-only mode
  if (showSeekerView && !showDonorView) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Requests</Text>
        </View>

        <View style={styles.content}>{renderSeekerView()}</View>

        {/* FAB for creating requests */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={textColors.onPrimary} />
        </TouchableOpacity>

        {renderNewRequestModal()}

        <RequestDetailModal
          visible={showDetailModal}
          requestId={selectedRequestId}
          onClose={handleCloseDetailModal}
        />
      </View>
    );
  }

  // For donor-only mode
  if (showDonorView && !showSeekerView) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Incoming Requests</Text>
        </View>

        <View style={styles.content}>{renderDonorView()}</View>

        <RequestDetailModal
          visible={showDetailModal}
          requestId={selectedRequestId}
          onClose={handleCloseDetailModal}
        />
      </View>
    );
  }

  // Fallback: no mode set (shouldn't happen in practice)
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="help-circle-outline" size={48} color={textColors.tertiary} />
      <Text style={styles.emptyTitle}>Select a mode</Text>
      <Text style={styles.emptySubtitle}>
        Go to Profile and select Donor, Seeker, or Both.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: spacing(5),
    paddingBottom: spacing(2),
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: textColors.primary,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: backgroundColors.card,
    paddingHorizontal: spacing(5),
    paddingTop: spacing(4),
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: borderColors.default,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing(3),
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: primaryColors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    color: textColors.secondary,
  },
  tabTextActive: {
    color: primaryColors.primary,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing(5),
    paddingTop: spacing(4),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing(10),
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: fontWeight.semibold,
    color: textColors.primary,
    marginTop: spacing(4),
  },
  emptySubtitle: {
    fontSize: 14,
    color: textColors.secondary,
    textAlign: "center",
    marginTop: spacing(2),
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: spacing(6),
    right: spacing(6),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: primaryColors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.large,
  },
});
