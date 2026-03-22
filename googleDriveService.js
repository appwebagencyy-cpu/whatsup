/**
 * Google Drive Upload Service with OAuth2
 * Uploads media files to Google Drive
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// OAuth Credentials
const OAUTH_CREDENTIALS_PATH = path.join(__dirname, '..', 'oauth-credentials.json');
const TOKEN_PATH = path.join(__dirname, '..', 'drive-token.json');
const FOLDER_ID = '1fyPYWbKZ9HS-_R83Ubj5jYmc74gr1QIB';

let driveClient = null;

/**
 * Initialize Google Drive client with OAuth2
 */
async function initDriveClient() {
    if (driveClient) return driveClient;

    try {
        // Check if token exists
        if (!fs.existsSync(TOKEN_PATH)) {
            console.error('❌ Token not found! Run: node generateToken.js');
            return null;
        }

        const credentials = JSON.parse(fs.readFileSync(OAUTH_CREDENTIALS_PATH, 'utf8'));
        const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

        const { client_id, client_secret } = credentials.installed;

        const oauth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            'http://localhost:3000/oauth2callback'
        );

        oauth2Client.setCredentials(tokens);

        // Auto-refresh token if expired
        oauth2Client.on('tokens', (newTokens) => {
            const updatedTokens = { ...tokens, ...newTokens };
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(updatedTokens, null, 2));
            console.log('🔄 Token refreshed and saved');
        });

        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
        console.log('✅ Google Drive client initialized (OAuth2)');
        return driveClient;
    } catch (error) {
        console.error('❌ Failed to initialize Google Drive:', error.message);
        return null;
    }
}

/**
 * Upload file to Google Drive
 */
async function uploadToDrive(filePath, fileName, mimeType) {
    try {
        const drive = await initDriveClient();
        if (!drive) return { success: false, error: 'Drive client not initialized' };

        const fileMetadata = { name: fileName, parents: [FOLDER_ID] };
        const media = { mimeType: mimeType, body: fs.createReadStream(filePath) };

        console.log('📤 Uploading to Google Drive:', fileName);

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        // Make file publicly accessible
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: { role: 'reader', type: 'anyone' }
        });

        const directLink = 'https://drive.google.com/uc?export=view&id=' + response.data.id;
        console.log('✅ Uploaded successfully:', response.data.id);

        return { success: true, fileId: response.data.id, directLink: directLink };
    } catch (error) {
        console.error('❌ Upload to Drive failed:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Delete file from Google Drive
 */
async function deleteFromDrive(fileId) {
    try {
        const drive = await initDriveClient();
        if (!drive) return { success: false };

        await drive.files.delete({ fileId });
        return { success: true };
    } catch (error) {
        console.error('❌ Delete from Drive failed:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { initDriveClient, uploadToDrive, deleteFromDrive, FOLDER_ID };
