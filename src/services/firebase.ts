import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  getDocFromServer,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, CandidateApplication, ScheduledInterview, CalendarSlot, EmailConfiguration } from '../types';

export const DEFAULT_EMAIL_CONFIG: EmailConfiguration = {
  mode: 'default',
  senderEmail: 'airev.pk@gmail.com',
  senderName: 'AIREV Emerging Center Karachi',
  replyToEmail: 'hr@airev.pk',
  provider: 'brevo',
  apiKey: '',
  smtpHost: 'smtp-relay.brevo.com',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: ''
};

// Designated Portal Managers / Super Admins with full power
export const ADMIN_PORTAL_MANAGERS: string[] = [
  'airev.pk@gmail.com',
  'shakeelsaeedofficial@gmail.com'
];

export function isPortalManagerEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_PORTAL_MANAGERS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Ensure local persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence warning:', err);
});

// Initialize Firestore with configured custom database ID if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot per Firebase guidelines
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system_health', 'connection_test'));
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firestore offline mode detected.');
    }
  }
}
testFirestoreConnection();

// Authentication API & Session Storage
const SESSION_STORAGE_KEY = 'airev_active_auth_profile';

export function getLocalStoredSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local session:', e);
  }
  return null;
}

export function setLocalStoredSession(profile: UserProfile | null): void {
  try {
    if (profile) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Error saving local session:', e);
  }
}

export async function directSignInWithEmail(email: string, customName?: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const isManager = isPortalManagerEmail(normalizedEmail);
  const cleanUid = `uid_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}`;

  let existingData: Partial<UserProfile> = {};
  try {
    const userDocRef = doc(db, 'users', cleanUid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      existingData = snap.data() as UserProfile;
    }
  } catch (e) {
    console.warn('Could not read existing doc in directSignIn:', e);
  }

  const profile: UserProfile = {
    uid: cleanUid,
    email: normalizedEmail,
    displayName: customName || existingData.displayName || (normalizedEmail === 'shakeelsaeedofficial@gmail.com' ? 'Muhammad Shakeel' : (normalizedEmail === 'airev.pk@gmail.com' ? 'AIREV Systems Admin' : normalizedEmail.split('@')[0])),
    photoURL: existingData.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName || normalizedEmail)}`,
    phoneNumber: existingData.phoneNumber || (isManager ? '+92 300 1234567' : ''),
    whatsappAvailable: existingData.whatsappAvailable ?? true,
    city: existingData.city || 'Karachi',
    linkedInUrl: existingData.linkedInUrl || '',
    portfolioUrl: existingData.portfolioUrl || '',
    bio: existingData.bio || (isManager ? 'AIREV Portal Manager & Systems Architect, Karachi' : 'Candidate'),
    role: isManager ? 'admin' : (existingData.role || (normalizedEmail.includes('recruiter') ? 'recruiter' : 'candidate')),
    isPortalManager: isManager,
    permissions: isManager ? [
      'manage_jobs',
      'manage_pipeline',
      'manage_candidates',
      'manage_interviewers',
      'export_data',
      'override_scores',
      'delete_records',
      'manage_slots'
    ] : existingData.permissions
  };

  await syncUserProfile(profile);
  setLocalStoredSession(profile);
  return profile;
}

export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const isManager = isPortalManagerEmail(user.email);

    // Read existing profile to preserve saved contact number and details
    let existingData: Partial<UserProfile> = {};
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        existingData = snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Could not read existing user doc:', e);
    }

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: existingData.displayName || user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || existingData.photoURL || undefined,
      phoneNumber: existingData.phoneNumber || (isManager ? '+92 300 0000000' : ''),
      whatsappAvailable: existingData.whatsappAvailable ?? true,
      city: existingData.city || 'Karachi',
      linkedInUrl: existingData.linkedInUrl || '',
      portfolioUrl: existingData.portfolioUrl || '',
      bio: existingData.bio || '',
      role: isManager ? 'admin' : (existingData.role || (user.email?.includes('recruiter') ? 'recruiter' : 'candidate')),
      isPortalManager: isManager,
      permissions: isManager ? [
        'manage_jobs',
        'manage_pipeline',
        'manage_candidates',
        'manage_interviewers',
        'export_data',
        'override_scores',
        'delete_records',
        'manage_slots'
      ] : existingData.permissions
    };
    await syncUserProfile(profile);
    setLocalStoredSession(profile);
    return profile;
  } catch (err: any) {
    console.error('Google Sign-In failed:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  setLocalStoredSession(null);
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('SignOut warning:', e);
  }
}

export async function saveUserProfile(updatedFields: Partial<UserProfile> & { uid: string }): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', updatedFields.uid);
    await setDoc(userDocRef, {
      ...updatedFields,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving user profile to Firestore:', err);
    throw err;
  }
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  // Check local stored session first so user isn't logged out on refresh
  const storedSession = getLocalStoredSession();
  if (storedSession) {
    callback(storedSession);
  }

  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      const active = getLocalStoredSession();
      if (!active) {
        callback(null);
      }
      return;
    }

    try {
      const isManager = isPortalManagerEmail(firebaseUser.email);
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // Enforce admin privileges if user is in designated portal managers list
        if (isManager && (data.role !== 'admin' || !data.isPortalManager)) {
          data.role = 'admin';
          data.isPortalManager = true;
          data.permissions = [
            'manage_jobs',
            'manage_pipeline',
            'manage_candidates',
            'manage_interviewers',
            'export_data',
            'override_scores',
            'delete_records',
            'manage_slots'
          ];
          await syncUserProfile(data);
        }
        setLocalStoredSession(data);
        callback(data);
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Portal User',
          photoURL: firebaseUser.photoURL || undefined,
          phoneNumber: isManager ? '+92 300 0000000' : '',
          whatsappAvailable: true,
          city: 'Karachi',
          role: isManager ? 'admin' : (firebaseUser.email?.includes('recruiter') ? 'recruiter' : 'candidate'),
          isPortalManager: isManager,
          permissions: isManager ? [
            'manage_jobs',
            'manage_pipeline',
            'manage_candidates',
            'manage_interviewers',
            'export_data',
            'override_scores',
            'delete_records',
            'manage_slots'
          ] : undefined
        };
        await syncUserProfile(newProfile);
        setLocalStoredSession(newProfile);
        callback(newProfile);
      }
    } catch (err) {
      // Fallback profile if Firestore read fails
      const isManager = isPortalManagerEmail(firebaseUser.email);
      const fallback: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        phoneNumber: isManager ? '+92 300 0000000' : '',
        role: isManager ? 'admin' : 'candidate',
        isPortalManager: isManager
      };
      setLocalStoredSession(fallback);
      callback(fallback);
    }
  });
}

export async function syncUserProfile(profile: UserProfile): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    await setDoc(userDocRef, {
      ...profile,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err);
  }
}

// Candidates Persistence
export async function persistCandidateApplication(appData: CandidateApplication): Promise<void> {
  try {
    const docRef = doc(db, 'candidates', appData.id);
    await setDoc(docRef, {
      ...appData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error persisting candidate to Firestore:', err);
  }
}

export async function deleteCandidateApplication(candidateId: string): Promise<void> {
  try {
    const docRef = doc(db, 'candidates', candidateId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Error deleting candidate from Firestore:', err);
    throw err;
  }
}

export async function fetchAllCandidateApplications(): Promise<CandidateApplication[]> {
  try {
    const candidatesCol = collection(db, 'candidates');
    const snap = await getDocs(candidatesCol);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as CandidateApplication);
    }
  } catch (err) {
    console.warn('Could not fetch candidates from Firestore:', err);
  }
  return [];
}

// Schedules Persistence
export async function persistScheduledInterview(schedule: ScheduledInterview): Promise<void> {
  try {
    const schedRef = doc(db, 'schedules', schedule.id);
    await setDoc(schedRef, {
      ...schedule,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error persisting interview schedule to Firestore:', err);
  }
}

export async function fetchAllScheduledInterviews(): Promise<ScheduledInterview[]> {
  try {
    const snap = await getDocs(collection(db, 'schedules'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ScheduledInterview);
    }
  } catch (err) {
    console.warn('Could not fetch schedules from Firestore:', err);
  }
  return [];
}

// Live Calendar Slots Persistence
export async function fetchLiveCalendarSlots(): Promise<CalendarSlot[]> {
  try {
    const snap = await getDocs(collection(db, 'slots'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as CalendarSlot);
    }
  } catch (err) {
    console.warn('Could not fetch slots from Firestore:', err);
  }
  return [];
}

export async function bookSlotInFirestore(slotId: string, bookedByEmail: string): Promise<void> {
  try {
    const slotRef = doc(db, 'slots', slotId);
    await updateDoc(slotRef, {
      isBooked: true,
      bookedByEmail
    });
  } catch (err) {
    console.warn('Could not update slot booking:', err);
  }
}

// System Email Configuration Persistence
export async function fetchEmailConfiguration(): Promise<EmailConfiguration> {
  try {
    const configDoc = doc(db, 'settings', 'email_configuration');
    const snap = await getDoc(configDoc);
    if (snap.exists()) {
      return { ...DEFAULT_EMAIL_CONFIG, ...snap.data() } as EmailConfiguration;
    }
  } catch (err) {
    console.warn('Could not fetch email config from Firestore:', err);
  }
  return DEFAULT_EMAIL_CONFIG;
}

export async function persistEmailConfiguration(config: EmailConfiguration): Promise<void> {
  try {
    const configDoc = doc(db, 'settings', 'email_configuration');
    await setDoc(configDoc, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not save email configuration to Firestore:', err);
    throw err;
  }
}
