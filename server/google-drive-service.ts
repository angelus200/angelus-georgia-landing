import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'google-drive-token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-drive-credentials.json');

let oauth2Client: OAuth2Client | null = null;

export async function initializeGoogleDrive() {
  try {
    const credentials = JSON.parse(
      fs.readFileSync(CREDENTIALS_PATH, 'utf8')
    );
    
    const { client_id, client_secret, redirect_uris } = credentials.installed;
    oauth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    // Load saved token if exists
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oauth2Client.setCredentials(token);
    }

    return oauth2Client;
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    return null;
  }
}

export function getAuthUrl(): string {
  if (!oauth2Client) {
    throw new Error('Google Drive not initialized');
  }

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

export async function setAuthCode(code: string): Promise<boolean> {
  try {
    if (!oauth2Client) {
      throw new Error('Google Drive not initialized');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save token for future use
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    return true;
  } catch (error) {
    console.error('Failed to set auth code:', error);
    return false;
  }
}

export async function listFolders(parentFolderId?: string): Promise<any[]> {
  try {
    if (!oauth2Client) {
      throw new Error('Google Drive not initialized');
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    let query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    const res = await drive.files.list({
      q: query,
      spaces: 'drive',
      fields: 'files(id, name, webViewLink)',
      pageSize: 100,
    });

    return res.data.files || [];
  } catch (error) {
    console.error('Failed to list folders:', error);
    return [];
  }
}

export async function listFilesInFolder(folderId: string): Promise<any[]> {
  try {
    if (!oauth2Client) {
      throw new Error('Google Drive not initialized');
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, mimeType, webViewLink, size)',
      pageSize: 100,
    });

    return res.data.files || [];
  } catch (error) {
    console.error('Failed to list files:', error);
    return [];
  }
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  try {
    if (!oauth2Client) {
      throw new Error('Google Drive not initialized');
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    return Buffer.from(res.data as ArrayBuffer);
  } catch (error) {
    console.error('Failed to download file:', error);
    throw error;
  }
}

export async function getFileMetadata(fileId: string): Promise<any> {
  try {
    if (!oauth2Client) {
      throw new Error('Google Drive not initialized');
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const res = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime',
    });

    return res.data;
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    return null;
  }
}

export async function searchFolderByName(folderName: string): Promise<string | null> {
  try {
    if (!oauth2Client) {
      throw new Error('Google Drive not initialized');
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const res = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 1,
    });

    const files = res.data.files;
    if (files && files.length > 0) {
      return files[0].id || null;
    }

    return null;
  } catch (error) {
    console.error('Failed to search folder:', error);
    return null;
  }
}

export function isGoogleDriveInitialized(): boolean {
  return oauth2Client !== null && fs.existsSync(TOKEN_PATH);
}
