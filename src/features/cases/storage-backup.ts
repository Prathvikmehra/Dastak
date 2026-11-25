import { KeyValueStorage } from './storage';
import { logger } from '../../lib/logger';

let backupSequence = 0;

/**
 * Stores corrupt data to a backup key and prunes older backups so at most
 * the 3 most recent backups for this storageKey are kept.
 */
export async function backupCorruptData(
  storage: KeyValueStorage,
  storageKey: string,
  rawStr: string,
  now: number = Date.now()
): Promise<string> {
  const timestampStr = String(now).padStart(15, '0');
  const seqStr = String(backupSequence++ % 10000).padStart(4, '0');
  const backupKey = `${storageKey}_backup_${timestampStr}_${seqStr}`;

  try {
    await storage.setItem(backupKey, rawStr);
  } catch (err) {
    logger.error(`Failed to store corrupt backup for key ${storageKey}`, err);
    return backupKey;
  }

  if (storage.getAllKeys) {
    try {
      const allKeys = await storage.getAllKeys();
      const prefix = `${storageKey}_backup_`;
      const backupKeys = allKeys.filter((k) => k.startsWith(prefix));
      if (backupKeys.length > 3) {
        backupKeys.sort((a, b) => b.localeCompare(a));
        const toDelete = backupKeys.slice(3);
        for (const k of toDelete) {
          await storage.removeItem(k);
        }
      }
    } catch (err) {
      logger.warn(`Failed to prune old corrupt backups for key ${storageKey}`, err);
    }
  }

  return backupKey;
}
