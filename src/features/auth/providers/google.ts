import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { env } from '@/lib/env';

let configured = false;
function configure() {
  if (configured) return;
  GoogleSignin.configure({
    // The *web* client id is the audience your backend verifies the ID token against.
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId,
  });
  configured = true;
}

/** Returns a Google ID token, or null if the user cancelled. */
export async function getGoogleIdToken(): Promise<string | null> {
  configure();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;
    if (!response.data.idToken)
      throw new Error('Google did not return an ID token. Check webClientId.');
    return response.data.idToken;
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) return null;
    throw e;
  }
}

export async function signOutGoogle() {
  configure();
  await GoogleSignin.signOut().catch(() => {});
}
