import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppData } from '../types';
import { sanitizeAppData } from './storage';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface DriveBackupFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: (user: User | null) => void,
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.(user);
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.(null);
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Impossible d'obtenir le jeton d'accès Google Drive.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const clearAccessToken = (): void => {
  cachedAccessToken = null;
};

export const logout = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
};

async function driveFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAccessToken();
    throw new Error('AUTH_EXPIRED');
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Erreur Google Drive (${response.status}) ${errText}`.trim());
  }

  return response;
}

export async function listDriveBackups(): Promise<DriveBackupFile[]> {
  const query = "trashed = false and mimeType = 'application/json'";
  const params = new URLSearchParams({
    q: query,
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,modifiedTime)',
    pageSize: '20',
  });

  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
  const data = (await res.json()) as { files?: DriveBackupFile[] };
  return data.files ?? [];
}

export async function createDriveBackup(data: AppData, customFileName?: string): Promise<DriveBackupFile> {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10);
  const timePart = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
  const fileName = customFileName?.trim() || `menus-courses-${datePart}-${timePart}.json`;

  const metadata = {
    name: fileName.endsWith('.json') ? fileName : `${fileName}.json`,
    mimeType: 'application/json',
  };

  const boundary = `-------a-table-boundary-${Date.now().toString(36)}`;
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(data, null, 2),
    `--${boundary}--`,
  ].join('\r\n');

  const res = await driveFetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime',
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );

  return (await res.json()) as DriveBackupFile;
}

export async function updateDriveBackup(fileId: string, data: AppData): Promise<DriveBackupFile> {
  const res = await driveFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,modifiedTime`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(data, null, 2),
    },
  );

  return (await res.json()) as DriveBackupFile;
}

export async function downloadDriveBackup(fileId: string): Promise<AppData> {
  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
  );
  const raw = await res.json();
  return sanitizeAppData(raw);
}

export async function deleteDriveBackup(fileId: string): Promise<void> {
  await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
  });
}
