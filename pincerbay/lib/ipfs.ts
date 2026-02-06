import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.md', '.json', '.txt'];

interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export class PinataIPFSService {
  private readonly PINATA_JWT: string;
  private readonly PINATA_UPLOAD_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  constructor(jwt: string) {
    this.PINATA_JWT = jwt;
  }

  /**
   * Validate file size and extension
   * @param filePath Local path of the file
   */
  private async validateFile(filePath: string): Promise<void> {
    const stats = fs.statSync(filePath);
    
    // 1. Size Check
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 10MB limit: ${stats.size} bytes`);
    }

    // 2. Extension Check (simple validation for text files)
    const ext = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }
  }

  /**
   * Upload a file to IPFS using Pinata
   * @param filePath Local path of the file to upload
   * @param options Optional metadata for the upload
   * @returns Promise resolving to IPFS hash of the uploaded file
   */
  async uploadFile(
    filePath: string, 
    options: { 
      name?: string, 
      keyvalues?: Record<string, string | number> 
    } = {}
  ): Promise<PinataUploadResponse> {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Perform validation
    await this.validateFile(filePath);

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    // Optional metadata
    if (options.name) {
      formData.append('pinataMetadata', JSON.stringify({
        name: options.name,
        keyvalues: options.keyvalues || {}
      }));
    }

    try {
      // Upload to Pinata
      const response = await axios.post(this.PINATA_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
          'Authorization': `Bearer ${this.PINATA_JWT}`
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      return response.data;
    } catch (error) {
      console.error('Pinata IPFS Upload Error:', error);
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Upload JSON content to IPFS
   * @param jsonContent Object to upload as JSON
   * @param options Optional metadata for the upload
   * @returns Promise resolving to IPFS hash of the uploaded JSON
   */
  async uploadJSON(
    jsonContent: object, 
    options: { 
      name?: string, 
      keyvalues?: Record<string, string | number> 
    } = {}
  ): Promise<PinataUploadResponse> {
    try {
      // Create temporary file for JSON
      const tempFilePath = this.createTempJsonFile(jsonContent);

      try {
        // Upload the temporary JSON file
        return await this.uploadFile(tempFilePath, options);
      } finally {
        // Clean up temporary file
        fs.unlinkSync(tempFilePath);
      }
    } catch (error) {
      console.error('Pinata IPFS JSON Upload Error:', error);
      throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a temporary file with JSON content
   * @param jsonContent Object to convert to JSON file
   * @returns Path to the temporary JSON file
   */
  private createTempJsonFile(jsonContent: object): string {
    const tempFilePath = `${process.cwd()}/temp_${Date.now()}.json`;
    fs.writeFileSync(tempFilePath, JSON.stringify(jsonContent, null, 2));
    return tempFilePath;
  }
}

/**
 * Factory function to create a Pinata IPFS Service
 * @param jwt Pinata JWT for authentication
 * @returns Configured PinataIPFSService instance
 */
export function createPinataIPFSService(jwt: string): PinataIPFSService {
  return new PinataIPFSService(jwt);
}