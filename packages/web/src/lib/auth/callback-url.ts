const DEFAULT_AUTH_CALLBACK_URL = "/dashboard";

export function authCallbackURL(value?: string | string[]) {
  const callbackURL = Array.isArray(value) ? value[0] : value;

  if (!callbackURL?.startsWith("/") || callbackURL.startsWith("//")) {
    return DEFAULT_AUTH_CALLBACK_URL;
  }

  return callbackURL;
}

export function authHref(pathname: string, callbackURL?: string | string[]) {
  return `${pathname}?callbackURL=${encodeURIComponent(authCallbackURL(callbackURL))}`;
}

export function inviteCallbackURL(token: string) {
  return `/invite/${encodeURIComponent(token)}`;
}

export function inviteSignInHref(token: string) {
  return authHref("/sign-in", inviteCallbackURL(token));
}

export function inviteSignUpHref(token: string) {
  return authHref("/sign-up", inviteCallbackURL(token));
}
