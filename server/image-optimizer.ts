import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png' | 'avif';
  preserveAspectRatio?: boolean;
}

interface OptimizationResult {
  success: boolean;
  buffer?: Buffer;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  format: string;
  error?: string;
}

interface ThumbnailOptions {
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: 'webp',
  preserveAspectRatio: true,
};

const PROPERTY_IMAGE_OPTIONS: OptimizationOptions = {
  maxWidth: 1600,
  maxHeight: 1200,
  quality: 85,
  format: 'webp',
  preserveAspectRatio: true,
};

const THUMBNAIL_OPTIONS: ThumbnailOptions = {
  width: 400,
  height: 300,
  fit: 'cover',
  quality: 80,
  format: 'webp',
};

/**
 * Optimize an image with specified options
 */
export async function optimizeImage(
  input: Buffer | string,
  options: OptimizationOptions = DEFAULT_OPTIONS
): Promise<OptimizationResult> {
  try {
    let inputBuffer: Buffer;

    // Handle different input types
    if (Buffer.isBuffer(input)) {
      inputBuffer = input;
    } else if (input.startsWith('data:')) {
      // Base64 data URL
      const base64Data = input.split(',')[1];
      inputBuffer = Buffer.from(base64Data, 'base64');
    } else if (input.startsWith('http://') || input.startsWith('https://')) {
      // URL - fetch the image
      const response = await fetch(input);
      const arrayBuffer = await response.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuffer);
    } else {
      // File path
      inputBuffer = await fs.promises.readFile(input);
    }

    const originalSize = inputBuffer.length;

    // Get original metadata
    const metadata = await sharp(inputBuffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Calculate new dimensions
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (options.preserveAspectRatio !== false) {
      const maxWidth = options.maxWidth || DEFAULT_OPTIONS.maxWidth!;
      const maxHeight = options.maxHeight || DEFAULT_OPTIONS.maxHeight!;

      if (originalWidth > maxWidth || originalHeight > maxHeight) {
        const widthRatio = maxWidth / originalWidth;
        const heightRatio = maxHeight / originalHeight;
        const ratio = Math.min(widthRatio, heightRatio);

        newWidth = Math.round(originalWidth * ratio);
        newHeight = Math.round(originalHeight * ratio);
      }
    } else {
      newWidth = options.maxWidth || originalWidth;
      newHeight = options.maxHeight || originalHeight;
    }

    // Process image
    let sharpInstance = sharp(inputBuffer).resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    // Apply format-specific optimization
    const format = options.format || 'webp';
    const quality = options.quality || 85;

    let outputBuffer: Buffer;

    switch (format) {
      case 'webp':
        outputBuffer = await sharpInstance
          .webp({ quality, effort: 4 })
          .toBuffer();
        break;
      case 'jpeg':
        outputBuffer = await sharpInstance
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
        break;
      case 'png':
        outputBuffer = await sharpInstance
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
        break;
      case 'avif':
        outputBuffer = await sharpInstance
          .avif({ quality, effort: 4 })
          .toBuffer();
        break;
      default:
        outputBuffer = await sharpInstance.webp({ quality }).toBuffer();
    }

    const optimizedSize = outputBuffer.length;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

    return {
      success: true,
      buffer: outputBuffer,
      originalSize,
      optimizedSize,
      compressionRatio,
      width: newWidth,
      height: newHeight,
      format,
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    return {
      success: false,
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 0,
      width: 0,
      height: 0,
      format: options.format || 'webp',
      error: error instanceof Error ? error.message : 'Unknown optimization error',
    };
  }
}

/**
 * Create a thumbnail from an image
 */
export async function createThumbnail(
  input: Buffer | string,
  options: ThumbnailOptions = THUMBNAIL_OPTIONS
): Promise<OptimizationResult> {
  try {
    let inputBuffer: Buffer;

    if (Buffer.isBuffer(input)) {
      inputBuffer = input;
    } else if (input.startsWith('data:')) {
      const base64Data = input.split(',')[1];
      inputBuffer = Buffer.from(base64Data, 'base64');
    } else if (input.startsWith('http://') || input.startsWith('https://')) {
      const response = await fetch(input);
      const arrayBuffer = await response.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuffer);
    } else {
      inputBuffer = await fs.promises.readFile(input);
    }

    const originalSize = inputBuffer.length;

    let sharpInstance = sharp(inputBuffer).resize(options.width, options.height, {
      fit: options.fit || 'cover',
      position: 'center',
    });

    const format = options.format || 'webp';
    const quality = options.quality || 80;

    let outputBuffer: Buffer;

    switch (format) {
      case 'webp':
        outputBuffer = await sharpInstance.webp({ quality }).toBuffer();
        break;
      case 'jpeg':
        outputBuffer = await sharpInstance.jpeg({ quality, mozjpeg: true }).toBuffer();
        break;
      case 'png':
        outputBuffer = await sharpInstance.png({ quality }).toBuffer();
        break;
      default:
        outputBuffer = await sharpInstance.webp({ quality }).toBuffer();
    }

    const optimizedSize = outputBuffer.length;

    return {
      success: true,
      buffer: outputBuffer,
      originalSize,
      optimizedSize,
      compressionRatio: ((originalSize - optimizedSize) / originalSize) * 100,
      width: options.width,
      height: options.height,
      format,
    };
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    return {
      success: false,
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 0,
      width: 0,
      height: 0,
      format: options.format || 'webp',
      error: error instanceof Error ? error.message : 'Unknown thumbnail error',
    };
  }
}

/**
 * Optimize image specifically for property listings
 */
export async function optimizePropertyImage(
  input: Buffer | string
): Promise<OptimizationResult> {
  return optimizeImage(input, PROPERTY_IMAGE_OPTIONS);
}

/**
 * Create property thumbnail
 */
export async function createPropertyThumbnail(
  input: Buffer | string
): Promise<OptimizationResult> {
  return createThumbnail(input, {
    width: 400,
    height: 300,
    fit: 'cover',
    quality: 80,
    format: 'webp',
  });
}

/**
 * Batch optimize multiple images
 */
export async function batchOptimizeImages(
  inputs: Array<Buffer | string>,
  options: OptimizationOptions = DEFAULT_OPTIONS
): Promise<OptimizationResult[]> {
  const results: OptimizationResult[] = [];

  for (const input of inputs) {
    const result = await optimizeImage(input, options);
    results.push(result);
  }

  return results;
}

/**
 * Get image metadata without processing
 */
export async function getImageMetadata(input: Buffer | string): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
}> {
  let inputBuffer: Buffer;

  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else if (input.startsWith('data:')) {
    const base64Data = input.split(',')[1];
    inputBuffer = Buffer.from(base64Data, 'base64');
  } else if (input.startsWith('http://') || input.startsWith('https://')) {
    const response = await fetch(input);
    const arrayBuffer = await response.arrayBuffer();
    inputBuffer = Buffer.from(arrayBuffer);
  } else {
    inputBuffer = await fs.promises.readFile(input);
  }

  const metadata = await sharp(inputBuffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: inputBuffer.length,
    hasAlpha: metadata.hasAlpha || false,
  };
}

/**
 * Convert image format
 */
export async function convertImageFormat(
  input: Buffer | string,
  targetFormat: 'jpeg' | 'webp' | 'png' | 'avif',
  quality: number = 85
): Promise<OptimizationResult> {
  return optimizeImage(input, {
    format: targetFormat,
    quality,
    maxWidth: 4096, // Allow larger images for format conversion
    maxHeight: 4096,
  });
}

/**
 * Auto-rotate image based on EXIF data
 */
export async function autoRotateImage(input: Buffer | string): Promise<Buffer> {
  let inputBuffer: Buffer;

  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else if (input.startsWith('data:')) {
    const base64Data = input.split(',')[1];
    inputBuffer = Buffer.from(base64Data, 'base64');
  } else {
    inputBuffer = await fs.promises.readFile(input);
  }

  return sharp(inputBuffer).rotate().toBuffer();
}
