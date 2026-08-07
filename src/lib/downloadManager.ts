export interface DownloadedPdf {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subjectName: string;
  subjectId: string;
  chapterNumber: number;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  downloadedAt: string; // ISO string
}

const DOWNLOADS_KEY = "sk_mission_board_downloads_v1";
const DB_NAME = "SKMissionBoardPDFs";
const STORE_NAME = "pdf_blobs";

// Helper for IndexedDB
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePdfBlobToOffline(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to save PDF blob to IndexedDB:", err);
  }
}

export async function getOfflinePdfBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("Failed to get PDF blob from IndexedDB:", err);
    return null;
  }
}

export async function deleteOfflinePdfBlob(id: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to delete PDF blob from IndexedDB:", err);
  }
}

export function getDownloadedPdfs(): DownloadedPdf[] {
  try {
    const data = localStorage.getItem(DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading downloads from localStorage:", err);
    return [];
  }
}

export function isPdfDownloaded(chapterId: string): boolean {
  const downloads = getDownloadedPdfs();
  return downloads.some((item) => item.chapterId === chapterId || item.id === chapterId);
}

export async function addPdfToDownloads(pdf: Omit<DownloadedPdf, "id" | "downloadedAt">, blob?: Blob): Promise<DownloadedPdf> {
  const downloads = getDownloadedPdfs();
  const existingIdx = downloads.findIndex((item) => item.chapterId === pdf.chapterId);
  
  const newItem: DownloadedPdf = {
    ...pdf,
    id: pdf.chapterId || `pdf-${Date.now()}`,
    downloadedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    downloads[existingIdx] = newItem;
  } else {
    downloads.unshift(newItem);
  }

  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));

  if (blob) {
    await savePdfBlobToOffline(newItem.id, blob);
  } else {
    // Attempt to fetch blob and store offline
    try {
      const res = await fetch(pdf.fileUrl);
      if (res.ok) {
        const fetchedBlob = await res.blob();
        await savePdfBlobToOffline(newItem.id, fetchedBlob);
      }
    } catch (e) {
      console.warn("Could not pre-cache PDF blob offline:", e);
    }
  }

  return newItem;
}

export async function removePdfFromDownloads(id: string): Promise<void> {
  const downloads = getDownloadedPdfs();
  const updated = downloads.filter((item) => item.id !== id && item.chapterId !== id);
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  await deleteOfflinePdfBlob(id);
}

export async function clearAllDownloads(): Promise<void> {
  const downloads = getDownloadedPdfs();
  for (const item of downloads) {
    await deleteOfflinePdfBlob(item.id);
  }
  localStorage.removeItem(DOWNLOADS_KEY);
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return "1.2 MB";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
