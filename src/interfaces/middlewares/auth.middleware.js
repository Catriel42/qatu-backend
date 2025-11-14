import admin from 'firebase-admin';
import UserRepository from '../../application/repositories/UserRepository.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../firebase-admin-sdk.json'), 'utf8'));

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

    // FIX: Use the correct snake_case column name 'iam_id' for the where clause
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
