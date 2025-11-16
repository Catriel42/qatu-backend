import admin from 'firebase-admin';
import { AuthenticationError } from '../../domain/errors/httpErrors.js';

// Middleware to verify Firebase ID token to Register/Authenticate requests
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided or invalid format.');
    }

    const idToken = authHeader.split('Bearer ')[1];
    // Verify the token and attach the decoded token to the request object
    req.decodedToken = await admin.auth().verifyIdToken(idToken);
    
    next();
  } catch (error) {
    console.error('Error during token verification:', error);
    if (error.code === 'auth/id-token-expired') {
      return next(new AuthenticationError('Authentication token expired.'));
    }
    if (error instanceof AuthenticationError) {
      return next(error);
    }
    return next(new AuthenticationError('Authentication failed.'));
  }
};
