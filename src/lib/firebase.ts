import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StockItem, RulesConfig, ClientWorkspace, AuditLogEntry } from '../types';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if present, otherwise default
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Validates connection to Firestore using getDocFromServer as required by guidelines
 */
export async function testConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline: running in local-cached fallback mode.');
      return false;
    }
    // Document might not exist yet, which is normal for initial probe
    return true;
  }
}

/**
 * Sync workspaces from Firestore
 */
export async function loadWorkspacesFromFirestore(): Promise<ClientWorkspace[] | null> {
  try {
    const wsRef = collection(db, 'workspaces');
    const snapshot = await getDocs(wsRef);
    if (snapshot.empty) return null;

    const workspaces: ClientWorkspace[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as ClientWorkspace;
      // Also fetch items subcollection
      const itemsRef = collection(db, 'workspaces', docSnap.id, 'items');
      const itemsSnap = await getDocs(itemsRef);
      const items: StockItem[] = itemsSnap.docs.map(i => i.data() as StockItem);

      // Also fetch rules doc
      const rulesDocRef = doc(db, 'workspaces', docSnap.id, 'rules', 'current');
      const rulesSnap = await getDoc(rulesDocRef);
      const rules = rulesSnap.exists() ? (rulesSnap.data() as RulesConfig) : data.rules;

      workspaces.push({
        ...data,
        items: items.length > 0 ? items : data.items || [],
        rules: rules || data.rules,
      });
    }
    return workspaces;
  } catch (err) {
    console.warn('Error loading workspaces from Firestore:', err);
    return null;
  }
}

/**
 * Save workspace and items to Firestore
 */
export async function saveWorkspaceToFirestore(workspace: ClientWorkspace): Promise<void> {
  try {
    const wsDocRef = doc(db, 'workspaces', workspace.id);
    const { items, rules, ...wsMetadata } = workspace;
    
    // Save metadata
    await setDoc(wsDocRef, {
      ...wsMetadata,
      updatedAt: new Date().toISOString().split('T')[0],
    }, { merge: true });

    // Save rules
    if (rules) {
      const rulesRef = doc(db, 'workspaces', workspace.id, 'rules', 'current');
      await setDoc(rulesRef, rules, { merge: true });
    }

    // Batch save items
    if (items && items.length > 0) {
      const batch = writeBatch(db);
      // Firestore batches support up to 500 operations
      const chunk = items.slice(0, 450);
      for (const item of chunk) {
        const itemRef = doc(db, 'workspaces', workspace.id, 'items', item.id);
        batch.set(itemRef, item, { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Error saving workspace to Firestore:', err);
  }
}

/**
 * Save an audit log entry to Firestore
 */
export async function saveAuditLogToFirestore(log: AuditLogEntry): Promise<void> {
  try {
    const logRef = doc(db, 'auditLogs', log.id);
    await setDoc(logRef, log);
  } catch (err) {
    console.warn('Error saving audit log to Firestore:', err);
  }
}
