// Storage helper for custom user-uploaded images for placeholders

const STORAGE_KEY = "linkconnect_landing_custom_images";

export interface CustomImagesMap {
  [key: string]: string; // key e.g. 'logo-placeholder' or 'work-photo-01' -> base64 or URL
}

export const getCustomImages = (): CustomImagesMap => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to parse custom images from localStorage:", e);
    return {};
  }
};

export const saveCustomImage = (key: string, dataUrl: string): void => {
  try {
    const current = getCustomImages();
    current[key] = dataUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    // Dispatch custom event for reactive updates across components
    window.dispatchEvent(new Event("custom-images-updated"));
  } catch (e) {
    console.error("Failed to save custom image to localStorage:", e);
  }
};

export const removeCustomImage = (key: string): void => {
  try {
    const current = getCustomImages();
    delete current[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event("custom-images-updated"));
  } catch (e) {
    console.error("Failed to remove custom image:", e);
  }
};

export const clearAllCustomImages = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("custom-images-updated"));
  } catch (e) {
    console.error("Failed to clear custom images:", e);
  }
};
