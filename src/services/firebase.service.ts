import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private initialized = false;

  constructor() {
    try {
      if (admin.apps.length === 0) {
        const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

        let credential: admin.ServiceAccount | undefined;

        if (serviceAccountEnv) {
          credential = JSON.parse(serviceAccountEnv) as admin.ServiceAccount;
        } else if (serviceAccountPath) {
          const raw = fs.readFileSync(serviceAccountPath, 'utf8');
          credential = JSON.parse(raw) as admin.ServiceAccount;
        }

        if (credential) {
          admin.initializeApp({
            credential: admin.credential.cert(credential),
          });
          this.initialized = true;
          this.logger.log('Initialized firebase-admin app');
        } else {
          this.logger.warn(
            'No Firebase service account provided; Firebase features will be disabled',
          );
        }
      } else {
        this.initialized = true;
      }
    } catch (error) {
      this.logger.error('Failed to initialize firebase-admin', error);
    }
  }

  public async verifyIdToken(idToken: string) {
    if (!this.initialized) {
      throw new Error('Firebase admin not initialized');
    }
    return await admin.auth().verifyIdToken(idToken);
  }

  public async getUserByUid(uid: string) {
    if (!this.initialized) return null;
    return await admin.auth().getUser(uid);
  }
}
