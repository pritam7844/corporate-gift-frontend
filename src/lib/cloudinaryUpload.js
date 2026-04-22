/**
 * Cloudinary Direct Signed Upload Utility
 * 
 * Flow:
 *  1. Request a signature from our Next.js API route (keeps API secret on server)
 *  2. Upload each file directly to Cloudinary using the signature
 *  3. Return the array of secure HTTPS URLs
 */

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validate all files are within 5 MB limit.
 * @param {File[]} files
 * @throws {Error} if any file exceeds the limit
 */
export function validateImageFiles(files) {
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB per image.`
      );
    }
  }
}

/**
 * Request a signed upload signature from our Next.js API route.
 * @param {string} folder - Cloudinary folder to upload into
 * @returns {Promise<{signature, timestamp, cloud_name, api_key, folder}>}
 */
async function getSignature(folder = 'products') {
  const res = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  if (!res.ok) throw new Error('Failed to get upload signature');
  return res.json();
}

/**
 * Upload a single file to Cloudinary using a signed upload.
 * @param {File} file
 * @param {string} folder
 * @returns {Promise<string>} secure_url
 */
async function uploadSingleFile(file, folder) {
  const { signature, timestamp, cloud_name, api_key } = await getSignature(folder);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const data = await res.json();
  return data.secure_url;
}

/**
 * Upload multiple image files to Cloudinary.
 * Validates size before uploading. Only uploads actual File objects (not existing URLs).
 * 
 * @param {File[]} files - Array of File objects to upload
 * @param {string} folder - Cloudinary folder ('products' | 'new-arrivals')
 * @returns {Promise<string[]>} Array of secure HTTPS URLs
 */
export async function uploadImagesToCloudinary(files, folder = 'products') {
  if (!files || files.length === 0) return [];

  // Validate sizes first — fail fast before any uploads
  validateImageFiles(files);

  // Upload all in parallel
  const urls = await Promise.all(
    files.map((file) => uploadSingleFile(file, folder))
  );

  return urls;
}
