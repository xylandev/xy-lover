// Dynamically import all stamp images from the assets/stamp directory
const stampModules = import.meta.glob('/assets/stamp/*.{png,jpg,jpeg,svg,webp}', { eager: true, import: 'default' });

// Extract the actual image URLs from the modules
export const STAMP_IMAGES: string[] = Object.values(stampModules) as string[];

// Get a random stamp image path
export const getRandomStamp = (): string => {
  if (STAMP_IMAGES.length === 0) {
    console.warn('No stamp images found in /assets/stamp directory');
    return '';
  }
  const randomIndex = Math.floor(Math.random() * STAMP_IMAGES.length);
  return STAMP_IMAGES[randomIndex];
};
