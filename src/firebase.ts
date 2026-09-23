import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { Item, Branch, Transaction, BaselineStock } from './types/inventory';

// User-provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC27mCIP9wNDP1bqN2M90NdcADQvwJJO9E",
  authDomain: "quan-ly-kho-def1b.firebaseapp.com",
  projectId: "quan-ly-kho-def1b",
  storageBucket: "quan-ly-kho-def1b.firebasestorage.app",
  messagingSenderId: "138644629577",
  appId: "1:138644629577:web:9aa0812f0245839dfa3798",
  measurementId: "G-FME3FR5DLV"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Operation types for standard error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Try to reach Firestore server
    await getDocFromServer(doc(db, 'cic_meta', 'ping'));
    return true;
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn('Firestore offline / unavailable, working with cache/fallback');
      return false;
    }
    // If it throws permission-denied or document-not-found, server is still connected
    return true;
  }
}

// Collection References
export const COLLECTIONS = {
  ITEMS: 'cic_items',
  BRANCHES: 'cic_branches',
  TRANSACTIONS: 'cic_transactions',
  META: 'cic_meta'
};

// Real-time listener for Items
export function subscribeToItems(onSuccess: (items: Item[]) => void, onError: (err: any) => void) {
  const q = collection(db, COLLECTIONS.ITEMS);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Item[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onSuccess(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ITEMS);
      onError(error);
    }
  );
}

// Real-time listener for Branches
export function subscribeToBranches(onSuccess: (branches: Branch[]) => void, onError: (err: any) => void) {
  const q = collection(db, COLLECTIONS.BRANCHES);
  return onSnapshot(
    q,
    (snapshot) => {
      const branches: Branch[] = [];
      snapshot.forEach((docSnap) => {
        branches.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onSuccess(branches);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.BRANCHES);
      onError(error);
    }
  );
}

// Real-time listener for Transactions
export function subscribeToTransactions(onSuccess: (transactions: Transaction[]) => void, onError: (err: any) => void) {
  const q = query(collection(db, COLLECTIONS.TRANSACTIONS), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        transactions.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onSuccess(transactions);
    },
    (error) => {
      // Fallback to unordered query if index is not yet built
      const fallbackQ = collection(db, COLLECTIONS.TRANSACTIONS);
      return onSnapshot(
        fallbackQ,
        (snapshot) => {
          const txs: Transaction[] = [];
          snapshot.forEach((d) => txs.push({ id: d.id, ...(d.data() as any) }));
          txs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          onSuccess(txs);
        },
        (innerErr) => {
          handleFirestoreError(innerErr, OperationType.LIST, COLLECTIONS.TRANSACTIONS);
          onError(innerErr);
        }
      );
    }
  );
}

// Real-time listener for System Meta (months, baseline stock)
export function subscribeToMeta(
  onSuccess: (meta: { months?: string[]; baselineStock?: BaselineStock }) => void,
  onError: (err: any) => void
) {
  const docRef = doc(db, COLLECTIONS.META, 'app_config');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onSuccess({
          months: data.months ? JSON.parse(data.months) : undefined,
          baselineStock: data.baselineStock ? JSON.parse(data.baselineStock) : undefined
        });
      } else {
        onSuccess({});
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.META}/app_config`);
      onError(error);
    }
  );
}

// --- CRUD Operations ---

// Save / Update Item
export async function saveItemToFirestore(item: Item): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ITEMS, item.id);
  try {
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.ITEMS}/${item.id}`);
    throw error;
  }
}

// Delete Item
export async function deleteItemFromFirestore(itemId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ITEMS, itemId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.ITEMS}/${itemId}`);
    throw error;
  }
}

// Save / Update Branch
export async function saveBranchToFirestore(branch: Branch): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BRANCHES, branch.id);
  try {
    await setDoc(docRef, branch, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.BRANCHES}/${branch.id}`);
    throw error;
  }
}

// Delete Branch
export async function deleteBranchFromFirestore(branchId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BRANCHES, branchId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.BRANCHES}/${branchId}`);
    throw error;
  }
}

// Save / Update Transaction
export async function saveTransactionToFirestore(tx: Transaction): Promise<void> {
  const docRef = doc(db, COLLECTIONS.TRANSACTIONS, tx.id);
  try {
    await setDoc(docRef, tx, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.TRANSACTIONS}/${tx.id}`);
    throw error;
  }
}

// Delete Transaction
export async function deleteTransactionFromFirestore(txId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.TRANSACTIONS, txId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.TRANSACTIONS}/${txId}`);
    throw error;
  }
}

// Save System Meta (Months & Baseline Stock)
export async function saveMetaToFirestore(data: { months?: string[]; baselineStock?: BaselineStock }): Promise<void> {
  const docRef = doc(db, COLLECTIONS.META, 'app_config');
  try {
    const payload: any = {
      updatedAt: new Date().toISOString()
    };
    if (data.months) payload.months = JSON.stringify(data.months);
    if (data.baselineStock) payload.baselineStock = JSON.stringify(data.baselineStock);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.META}/app_config`);
    throw error;
  }
}

// Batch Seed Default Initial Data if Firestore is completely fresh
export async function seedInitialFirestoreData(
  defaultItems: Item[],
  defaultBranches: Branch[],
  defaultTransactions: Transaction[],
  defaultMonths: string[],
  defaultBaselineStock: BaselineStock
): Promise<boolean> {
  try {
    const itemSnaps = await getDocs(collection(db, COLLECTIONS.ITEMS));
    if (!itemSnaps.empty) {
      // Data already exists in Firestore! No need to overwrite.
      return false;
    }

    const batch = writeBatch(db);

    // Seed Items
    defaultItems.forEach((it) => {
      const r = doc(db, COLLECTIONS.ITEMS, it.id);
      batch.set(r, it);
    });

    // Seed Branches
    defaultBranches.forEach((b) => {
      const r = doc(db, COLLECTIONS.BRANCHES, b.id);
      batch.set(r, b);
    });

    // Seed Transactions
    defaultTransactions.forEach((tx) => {
      const r = doc(db, COLLECTIONS.TRANSACTIONS, tx.id);
      batch.set(r, tx);
    });

    // Seed Meta
    const metaRef = doc(db, COLLECTIONS.META, 'app_config');
    batch.set(metaRef, {
      months: JSON.stringify(defaultMonths),
      baselineStock: JSON.stringify(defaultBaselineStock),
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
    console.log('✅ Seeded default CIC inventory data into Firebase Firestore!');
    return true;
  } catch (error) {
    console.warn('Could not seed initial Firestore data (might be offline or security rules pending):', error);
    return false;
  }
}
