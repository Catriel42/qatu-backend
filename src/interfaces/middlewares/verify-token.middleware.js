import admin from 'firebase-admin';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or invalid format.' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    // Verify the token and attach the decoded token to the request object
    req.decodedToken = await admin.auth().verifyIdToken(idToken);
    
    next();
  } catch (error) {
    console.error('Error during token verification:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Authentication token expired.' });
    }
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};
