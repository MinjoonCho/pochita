type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: { access_token?: string; error?: string }) => void;
  scope: string;
};

type GoogleTokenClient = {
  requestAccessToken: (override?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GoogleIdConfiguration) => GoogleTokenClient;
        };
      };
    };
  }
}

export type GoogleProfile = {
  email: string;
  name: string;
  sub: string;
};

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저 환경에서만 구글 로그인을 사용할 수 있어요."));
  }

  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("구글 로그인 스크립트를 불러오지 못했어요.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("구글 로그인 스크립트를 불러오지 못했어요."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("구글 사용자 정보를 가져오지 못했어요.");
  }

  const profile = (await response.json()) as Partial<GoogleProfile>;
  if (!profile.email || !profile.name || !profile.sub) {
    throw new Error("구글 사용자 정보가 올바르지 않아요.");
  }

  return {
    email: profile.email,
    name: profile.name,
    sub: profile.sub,
  };
}

export async function signInWithGoogle(): Promise<GoogleProfile> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID가 설정되지 않았어요.");
  }

  await loadGoogleScript();

  return new Promise<GoogleProfile>((resolve, reject) => {
    const google = window.google;
    if (!google?.accounts?.oauth2) {
      reject(new Error("구글 로그인 준비가 아직 끝나지 않았어요."));
      return;
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: async (tokenResponse) => {
        if (tokenResponse.error || !tokenResponse.access_token) {
          reject(new Error("구글 로그인을 완료하지 못했어요."));
          return;
        }

        try {
          const profile = await fetchGoogleProfile(tokenResponse.access_token);
          resolve(profile);
        } catch (error) {
          reject(error instanceof Error ? error : new Error("구글 로그인에 실패했어요."));
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}
