import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1600;
const QUALITY = 0.8;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// 画像を圧縮（最大1600px、WebP、品質80%）
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください。');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('画像は20MB以下にしてください。');
  }

  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height);
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('画像の処理に失敗しました。');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY)
  );
  if (!blob) throw new Error('画像の変換に失敗しました。');
  return blob;
}

// 圧縮して Storage にアップ → ダウンロードURLを返す
export async function uploadListingImage(
  file: File,
  advertiserId: string
): Promise<string> {
  const blob = await compressImage(file);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `listings/${advertiserId}/${id}.webp`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
  return getDownloadURL(storageRef);
}

// Storage から削除
export async function deleteListingImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // 既に消えている等は無視
  }
}
