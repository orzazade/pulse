import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import * as Location from 'expo-location';

import {
  SearchBar,
  FilterChip,
  SearchRequestCard,
  SearchRequest,
} from '../../components/search';
import {
  backgroundColors,
  textColors,
  headingStyles,
  bodyStyles,
  spacing,
} from '@/theme/tokens';

// Filter options
const FILTER_OPTIONS = [
  'All Requests',
  'Urgent',
  'Near Me',
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Requests');

  // Location state for "Near Me" filter
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Determine query args based on filter
  const queryArgs = useMemo(() => {
    // Blood type filter
    if (BLOOD_TYPES.includes(activeFilter)) {
      return { bloodType: activeFilter };
    }
    // Urgent filter
    if (activeFilter === 'Urgent') {
      return { urgency: 'urgent' as const };
    }
    // All Requests or Near Me (no server-side filtering for Near Me)
    return {};
  }, [activeFilter]);

  // Fetch open requests
  const requests = useQuery(api.requests.listOpenRequests, queryArgs);

  // Handle "Near Me" filter selection
  const handleFilterPress = async (filter: string) => {
    if (filter === 'Near Me') {
      // Request location permission and get location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      } catch {
        // Location not available, continue without distance
      }
    }
    setActiveFilter(filter);
  };

  // Define request type from query result
  type RequestWithSeeker = NonNullable<typeof requests>[number];

  // Filter requests based on search query and active filter
  const filteredRequests = useMemo(() => {
    if (!requests) return [] as RequestWithSeeker[];

    let filtered = requests;

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((request: RequestWithSeeker) => {
        const bloodTypeMatch = request.bloodType.toLowerCase().includes(query);
        const cityMatch = request.seeker?.city?.toLowerCase().includes(query);
        const notesMatch = request.notes?.toLowerCase().includes(query);
        return bloodTypeMatch || cityMatch || notesMatch;
      });
    }

    // For "Near Me", sort by distance if location available
    // (In a real app, distance would be calculated on the server with geospatial queries)
    // For now, we just show all requests since distance isn't in the data

    return filtered;
  }, [requests, searchQuery, activeFilter, userLocation]);

  // Transform requests to SearchRequest format
  const displayRequests: SearchRequest[] = useMemo(() => {
    return filteredRequests.map((request: RequestWithSeeker) => ({
      _id: request._id,
      bloodType: request.bloodType,
      title: request.notes
        ? `${request.bloodType} Blood Needed`
        : `${request.bloodType} Blood Needed`,
      location: request.seeker?.city || request.city,
      city: request.seeker?.city || request.city,
      createdAt: request.createdAt,
      urgency: request.urgency,
      notes: request.notes,
      // Distance would come from geospatial query in production
      distance: undefined,
    }));
  }, [filteredRequests]);

  const handleRequestPress = (request: SearchRequest) => {
    // Navigate to request details (placeholder for now)
    console.log('Request pressed:', request._id);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No requests found matching your criteria</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
    </View>
  );

  const isLoading = requests === undefined;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Requests</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search hospital, city or blood type"
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_OPTIONS.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              active={activeFilter === filter}
              onPress={() => handleFilterPress(filter)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsText}>
          {isLoading
            ? 'Searching...'
            : `Found ${displayRequests.length} active requests nearby`}
        </Text>
      </View>

      {/* Request Cards List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textColors.secondary} />
        </View>
      ) : (
        <FlatList
          data={displayRequests}
          renderItem={({ item }) => (
            <SearchRequestCard
              request={item}
              onPress={() => handleRequestPress(item)}
            />
          )}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.background,
  },
  header: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(4),
    paddingBottom: spacing(3),
  },
  title: {
    ...headingStyles.pageTitle,
    color: textColors.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(3),
  },
  filtersContainer: {
    paddingBottom: spacing(3),
  },
  filtersContent: {
    paddingHorizontal: spacing(5),
  },
  resultsCount: {
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(3),
  },
  resultsText: {
    ...bodyStyles.bodySmall,
    color: textColors.secondary,
  },
  listContent: {
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(5),
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing(15),
  },
  emptyText: {
    ...bodyStyles.body,
    color: textColors.primary,
    marginBottom: spacing(2),
  },
  emptySubtext: {
    ...bodyStyles.bodySmall,
    color: textColors.secondary,
  },
});
