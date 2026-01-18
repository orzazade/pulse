import { useSignUp } from "@clerk/clerk-expo";
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
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  colors,
  spacing,
  radius,
  textColors,
  primaryColors,
  inputSpec,
  buttonSpec,
  headingStyles,
  bodyStyles,
  fontWeight,
} from "@/theme/tokens";
import { SocialLoginSection } from "@/components/auth/SocialLoginSection";
import { TermsCheckbox } from "@/components/auth/TermsCheckbox";
import { BloodTypePicker } from "@/components/auth/BloodTypePicker";

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  // Form state
  const [fullName, setFullName] = useState("");
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: {
          fullName,
          bloodType,
        },
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Create user in Convex database with fullName and bloodType
        const userId = result.createdUserId;
        if (userId) {
          await getOrCreateUser({
            clerkId: userId,
            email,
            fullName: fullName || undefined,
            bloodType: bloodType || undefined,
          });
        }
        router.replace("/");
      } else {
        console.log("Verification status:", result.status);
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(clerkError.errors?.[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Can sign up only if terms accepted and all required fields filled
  const canSignUp = termsAccepted && email && password && !loading;

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={[styles.inner, { paddingTop: insets.top + spacing(10) }]}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to {email}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            placeholderTextColor={inputSpec.placeholderColor}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onVerify}
            disabled={loading || !code}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify Email"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPendingVerification(false)}>
            <Text style={styles.linkSingle}>Use a different email</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing(10), paddingBottom: insets.bottom + spacing(6) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Subtitle - Left aligned */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Complete your profile to start donating</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Full Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={inputSpec.placeholderColor}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoComplete="name"
        />

        {/* Blood Type Picker */}
        <BloodTypePicker
          value={bloodType}
          onSelect={setBloodType}
        />

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
          autoComplete="new-password"
        />

        {/* Terms Checkbox */}
        <TermsCheckbox
          checked={termsAccepted}
          onToggle={() => setTermsAccepted(!termsAccepted)}
        />

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonMargin,
            !canSignUp && styles.buttonDisabled,
          ]}
          onPress={onSignUp}
          disabled={!canSignUp}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* Social Login Section */}
        <SocialLoginSection variant="signup" />

        {/* Navigation Link */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.linkAction}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing(6), // 24px
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
  button: {
    height: buttonSpec.primary.height,
    backgroundColor: buttonSpec.primary.backgroundColor,
    borderRadius: buttonSpec.primary.borderRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonMargin: {
    marginTop: spacing(6), // 24px
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
  linkSingle: {
    color: primaryColors.primary,
    textAlign: "center",
    marginTop: spacing(6), // 24px
    fontSize: 15,
    fontWeight: fontWeight.medium,
  },
});
