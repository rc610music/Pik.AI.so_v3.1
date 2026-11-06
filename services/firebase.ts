import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if available
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

// Auth Helpers
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, provider);
    // Persist or update user profile in Firestore
    const user = result.user;
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString()
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
};

// Data Persistence Helpers for user history and creations
export interface UserCreation {
  id?: string;
  userId: string;
  tool: 'palette' | 'brand' | 'signature' | 'typography' | 'monogram' | 'logo' | 'video';
  prompt: string;
  style?: string;
  imageUrl?: string;
  videoUrl?: string;
  metadata?: any; // Additional data like BrandPackData, aspect ratio, model used etc.
  createdAt: string;
}

export const saveCreation = async (creation: Omit<UserCreation, 'createdAt'>): Promise<string> => {
  try {
    const creationData: UserCreation = {
      ...creation,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'creations'), creationData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving creation to Firestore:", error);
    throw error;
  }
};

export const getUserCreations = async (userId: string, tool?: string): Promise<UserCreation[]> => {
  try {
    let q = query(
      collection(db, 'creations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (tool) {
      q = query(
        collection(db, 'creations'),
        where('userId', '==', userId),
        where('tool', '==', tool),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const creations: UserCreation[] = [];
    querySnapshot.forEach((doc) => {
      creations.push({ id: doc.id, ...doc.data() } as UserCreation);
    });
    return creations;
  } catch (error) {
    console.error("Error fetching user creations:", error);
    // Fallback if index is building or not yet fully deployed
    try {
      // simpler query without orderBy (in case index is missing)
      const qSimple = query(
        collection(db, 'creations'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(qSimple);
      const creations: UserCreation[] = [];
      querySnapshot.forEach((doc) => {
        creations.push({ id: doc.id, ...doc.data() } as UserCreation);
      });
      // manual sort
      return creations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (fallbackError) {
      console.error("Simple query fallback also failed:", fallbackError);
      return [];
    }
  }
};

export const deleteCreation = async (creationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'creations', creationId));
  } catch (error) {
    console.error("Error deleting creation:", error);
    throw error;
  }
};
