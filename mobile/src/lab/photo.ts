import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export const PHOTO_MAX_EDGE = 1280;
export const PHOTO_JPEG_QUALITY = 0.7;

export type CompressedPhoto = { uri: string; width: number; height: number; bytes: number | null };

/** Thu ảnh chụp về cạnh dài tối đa PHOTO_MAX_EDGE, JPEG, trước khi lưu hoặc gửi. */
export async function compressPhoto(uri: string, width: number, height: number): Promise<CompressedPhoto> {
  const landscape = width >= height;
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize(landscape ? { width: PHOTO_MAX_EDGE } : { height: PHOTO_MAX_EDGE });
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: PHOTO_JPEG_QUALITY });
  return { uri: out.uri, width: out.width, height: out.height, bytes: new File(out.uri).size };
}
