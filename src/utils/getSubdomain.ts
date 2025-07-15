// utils/extractDbNameFromUrl.ts
export const extractDbNameFromUrl = (url: string): string | null => {
  try {
    const { hostname } = new URL(url); // parses http://gamersclub.localhost:5173

    const parts = hostname.split('.');
    
    if (hostname.includes('localhost')) {
      return parts[0]; // gamersclub.localhost => 'gamersclub'
    }

    if (parts.length >= 3) {
      return parts[0]; // e.g., gamersclub.example.com => 'gamersclub'
    }

    return null;
  } catch (err) {
    console.error('Invalid URL passed to extractDbNameFromUrl:', url);
    return null;
  }
};
