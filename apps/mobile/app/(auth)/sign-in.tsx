import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  spacing,
  radius,
  textColors,
  borderColors,
  primaryColors,
  inputSpec,
  buttonSpec,
  headingStyles,
  bodyStyles,
  fontWeight,
} from "@/theme/tokens";
import { SocialLoginSection } from "@/components/auth/SocialLoginSection";

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // User creation handled by index.tsx on first authenticated load
        router.replace("/");
      } else {
        // Handle other statuses if needed (e.g., needs_first_factor)
        console.log("Sign in status:", result.status);
        setError("Sign in incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Placeholder - Clerk password reset can be added later
    Alert.alert(
      "Forgot Password",
      "Password reset functionality will be available soon."
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={[styles.inner, { paddingTop: insets.top + spacing(10) }]}>
        {/* Title and Subtitle - Left aligned */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue donating</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={inputSpec.placeholderColor}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={inputSpec.placeholderColor}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {/* Forgot Password Link - Right aligned */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSignIn}
          disabled={loading || !email || !password}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        {/* Social Login Section */}
        <SocialLoginSection variant="signin" />

        {/* Navigation Link */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account? </Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.linkAction}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    padding: spacing(6), // 24px
  },
  title: {
    fontSize: headingStyles.hero.fontSize, // 32px
    fontWeight: headingStyles.hero.fontWeight, // extrabold
    color: textColors.primary,
    marginBottom: spacing(2), // 8px
    // Left aligned (default)
  },
  subtitle: {
    fontSize: bodyStyles.body.fontSize, // 16px
    fontWeight: bodyStyles.body.fontWeight, // normal
    color: textColors.secondary,
    marginBottom: spacing(8), // 32px
    // Left aligned (default)
  },
  input: {
    height: inputSpec.height,
    borderWidth: inputSpec.borderWidth,
    borderColor: inputSpec.borderColor,
    borderRadius: inputSpec.borderRadius,
    backgroundColor: inputSpec.backgroundColor,
    paddingHorizontal: inputSpec.paddingHorizontal,
    marginBottom: spacing(4), // 16px
    fontSize: inputSpec.fontSize,
    color: textColors.primary,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: spacing(6), // 24px
    marginTop: -spacing(2), // -8px to bring closer to password field
  },
  forgotPassword: {
    fontSize: 14,
    color: primaryColors.primary,
    fontWeight: fontWeight.medium,
  },
  button: {
    height: buttonSpec.primary.height,
    backgroundColor: buttonSpec.primary.backgroundColor,
    borderRadius: buttonSpec.primary.borderRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#FCA5A5", // primaryDisabled
  },
  buttonText: {
    color: buttonSpec.primary.textColor,
    fontWeight: buttonSpec.primary.fontWeight,
    fontSize: buttonSpec.primary.fontSize,
  },
  error: {
    color: primaryColors.primary,
    marginBottom: spacing(4), // 16px
    backgroundColor: primaryColors.primaryLight,
    padding: spacing(3), // 12px
    borderRadius: radius.md, // 8px
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing(6), // 24px
  },
  linkText: {
    fontSize: 15,
    color: textColors.secondary,
  },
  linkAction: {
    fontSize: 15,
    color: primaryColors.primary,
    fontWeight: fontWeight.medium,
  },
});
