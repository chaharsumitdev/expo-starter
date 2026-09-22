import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

export type AppleCredential = {
  identityToken: string;
  rawNonce: string;
  fullName: { givenName?: string | null; familyName?: string | null } | null;
  email: string | null;
};

/**
 * Native Sign in with Apple (iOS). A random nonce is hashed into the request; the backend
 * checks that sha256(rawNonce) matches the token's `nonce` claim to prevent replay.
 * Returns null if the user cancelled.
 */
export async function getAppleCredential(): Promise<AppleCredential | null> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) throw new Error('Apple did not return an identity token.');
    return {
      identityToken: credential.identityToken,
      rawNonce,
      fullName: credential.fullName
        ? { givenName: credential.fullName.givenName, familyName: credential.fullName.familyName }
        : null,
      email: credential.email,
    };
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    throw e;
  }
}

export const isAppleSignInAvailable = () => AppleAuthentication.isAvailableAsync();
