import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import type { ListingDocument } from '@/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function isValidDocumentType(type: string): boolean {
  return ALLOWED_TYPES.includes(type) || type.startsWith('image/');
}

export async function uploadListingDocument(
  file: File,
  advertiserId: string
): Promise<ListingDocument> {
  if (!isValidDocumentType(file.type)) {
    throw new Error('PDF・PowerPoint・画像のみアップロードできます。');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('1ファイルあたり10MB以下にしてください。');
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `listingDocuments/${advertiserId}/${id}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);

  return {
    name: file.name,
    url,
    path,
    size: file.size,
    type: file.type,
  };
}

export async function deleteListingDocument(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch {
    // 既に消えている等は無視
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
