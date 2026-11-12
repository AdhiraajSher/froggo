import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ContractDocument } from './types';

interface FroggoDB extends DBSchema {
  contracts: {
    key: string;
    value: ContractDocument;
    indexes: {
      'by-created': string;
      'by-role': string;
    };
  };
}

const DB_NAME = 'froggo-contracts-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FroggoDB>> | null = null;

function getDb(): Promise<IDBPDatabase<FroggoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FroggoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('contracts')) {
          const store = db.createObjectStore('contracts', { keyPath: 'id' });
          store.createIndex('by-created', 'createdAt');
          store.createIndex('by-role', 'role');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Fetch all stored contracts from IndexedDB, sorted newest first
 */
export async function getAllStoredContracts(): Promise<ContractDocument[]> {
  try {
    const db = await getDb();
    const all = await db.getAll('contracts');
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('[Froggo IndexedDB] Failed to load contracts:', err);
    return [];
  }
}

/**
 * Save a new contract or update an existing contract entry
 */
export async function saveContractToStore(contract: ContractDocument): Promise<void> {
  try {
    const db = await getDb();
    await db.put('contracts', contract);
  } catch (err) {
    console.error('[Froggo IndexedDB] Failed to save contract:', err);
  }
}

/**
 * Delete a contract by ID from IndexedDB
 */
export async function deleteContractFromStore(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('contracts', id);
  } catch (err) {
    console.error('[Froggo IndexedDB] Failed to delete contract:', err);
  }
}

/**
 * Rename an existing contract in IndexedDB
 */
export async function renameContractInStore(id: string, newTitle: string): Promise<ContractDocument | null> {
  try {
    const db = await getDb();
    const existing = await db.get('contracts', id);
    if (!existing) return null;
    const updated: ContractDocument = {
      ...existing,
      title: newTitle.trim() || existing.title,
    };
    await db.put('contracts', updated);
    return updated;
  } catch (err) {
    console.error('[Froggo IndexedDB] Failed to rename contract:', err);
    return null;
  }
}
