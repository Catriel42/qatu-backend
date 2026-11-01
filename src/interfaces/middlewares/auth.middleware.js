import admin from 'firebase-admin';
import UserRepository from '../../application/repositories/UserRepository.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccount = (() => {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
  const credPath = path.resolve(__dirname, '../../../firebase-admin-sdk.json');
  if (!fs.existsSync(credPath)) {
    throw new Error(
      'Missing Firebase credentials: set GOOGLE_SERVICE_ACCOUNT_JSON or provide firebase-admin-sdk.json (see firebase-admin-sdk.example.json).'
    );
  }
  return JSON.parse(fs.readFileSync(credPath, 'utf8'));
})();

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or invalid format.' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const iamId = decodedToken.uid;

    let user = await UserRepository.findByColumn('iam_id', iamId);

    if (!user) {
      // If user doesn't exist in our DB, but is authenticated by Firebase,
      // we might want to auto-create them or return an error.
      // For now, let's return an error, as user creation is a separate endpoint.
      return res.status(404).json({ message: 'User not found in application database.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error during authentication:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Authentication token expired.' });
    }
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};
