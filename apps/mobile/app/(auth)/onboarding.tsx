import { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { markOnboardingComplete } from "../../lib/onboarding";
import { AnimatedPagination } from "../../components/ui/AnimatedPagination";
import {
  colors,
  illustrationColors,
  textColors,
  primaryColors,
  typography,
  spacing,
  radius,
} from "../../theme";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  circleColor: string;
}

/**
 * Slide content matching PNG designs exactly
 */
const slides: Slide[] = [
  {
    id: "1",
    title: "Find Blood Donors Instantly",
    subtitle: "Connect with nearby donors in minutes",
    description:
      "When every second counts, Pulse connects you directly with available donors in your area.",
    circleColor: illustrationColors.pinkCircle, // #FEE2E2
  },
  {
    id: "2",
    title: "How It Works",
    subtitle: "Simple 3-step process",
    description:
      "Create a request with your blood type, verify your medical needs, and get connected instantly with verified donors ready to help.",
    circleColor: illustrationColors.greenCircle, // #D1FAE5
  },
  {
    id: "3",
    title: "Join the Community",
    subtitle: "Save lives together",
    description:
      "Be part of a growing network of heroes. Whether you donate or help spread the word, every action counts towards saving a life.",
    circleColor: illustrationColors.pinkCircle, // #FEE2E2
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleGetStarted = async () => {
    await markOnboardingComplete();
    router.replace("/sign-up");
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { paddingTop: insets.top + spacing(8) }]}>
      {/* Large decorative circle (no icon - clean PNG aesthetic) */}
      <View style={styles.circleContainer}>
        <View
          style={[
            styles.decorativeCircle,
            { backgroundColor: item.circleColor },
          ]}
        />
      </View>

      {/* Title - hero style from design tokens */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Subtitle - secondary text color */}
      <Text style={styles.subtitle}>{item.subtitle}</Text>

      {/* Description - secondary text color, smaller */}
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Animated Pagination with sliding pill */}
      <View style={styles.pagination}>
        <AnimatedPagination total={slides.length} current={currentIndex} />
      </View>

      {/* Buttons */}
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: Math.max(insets.bottom, spacing(12)) },
        ]}
      >
        {isLastSlide ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
              <Text style={styles.nextText}>Next</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={primaryColors.primary}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing(8), // 32px
  },
  circleContainer: {
    marginBottom: spacing(12), // 48px
  },
  decorativeCircle: {
    width: 200,
    height: 200,
    borderRadius: radius.full, // 9999px - perfect circle
  },
  title: {
    fontSize: typography.hero.fontSize, // 32px
    fontWeight: typography.hero.fontWeight, // extrabold (800)
    lineHeight: typography.hero.lineHeight, // 38
    color: textColors.primary, // #1F2937
    textAlign: "center",
    marginBottom: spacing(2), // 8px
  },
  subtitle: {
    fontSize: typography.body.fontSize, // 16px
    fontWeight: typography.body.fontWeight, // normal (400)
    lineHeight: typography.body.lineHeight, // 24
    color: textColors.secondary, // #6B7280
    textAlign: "center",
    marginBottom: spacing(6), // 24px
  },
  description: {
    fontSize: typography.body.fontSize, // 16px
    fontWeight: typography.body.fontWeight, // normal (400)
    lineHeight: typography.body.lineHeight, // 24
    color: textColors.secondary, // #6B7280
    textAlign: "center",
    paddingHorizontal: spacing(4), // 16px extra padding
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing(6), // 24px
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing(6), // 24px
  },
  skipButton: {
    paddingVertical: spacing(3), // 12px
    paddingHorizontal: spacing(6), // 24px
    minHeight: 48, // touch target
    justifyContent: "center",
  },
  skipText: {
    fontSize: typography.body.fontSize, // 16px
    fontWeight: typography.body.fontWeight, // normal (400)
    color: textColors.secondary, // #6B7280
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: primaryColors.primaryLight, // #FEE2E2
    paddingVertical: spacing(3), // 12px
    paddingHorizontal: spacing(6), // 24px
    borderRadius: radius.lg, // 12px
    gap: spacing(2), // 8px
    minHeight: 48, // touch target
  },
  nextText: {
    fontSize: typography.body.fontSize, // 16px
    fontWeight: typography.button.fontWeight, // semibold (600)
    color: primaryColors.primary, // #E53935
  },
  getStartedButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: primaryColors.primary, // #E53935
    paddingVertical: spacing(4), // 16px
    borderRadius: radius.lg, // 12px
    minHeight: 52, // from buttonSpec.primary.height
  },
  getStartedText: {
    fontSize: typography.button.fontSize, // 16px
    fontWeight: typography.button.fontWeight, // semibold (600)
    color: textColors.onPrimary, // #FFFFFF
  },
});
