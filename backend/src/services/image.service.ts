import sharp from 'sharp';

interface ProcessAvatarOptions {
  width: number;
  height: number;
  quality: number;
}

const AVATAR_OPTIONS: ProcessAvatarOptions = {
  width: 256, 
  height: 256,
  quality: 80
};

export async function processAvatar(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(AVATAR_OPTIONS.width, AVATAR_OPTIONS.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: AVATAR_OPTIONS.quality })
      .toBuffer();
  } catch (error) {
    throw new Error('Failed to process avatar image: ' + (error as Error).message);
  }
}