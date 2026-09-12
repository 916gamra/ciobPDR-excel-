import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { Logger } from '../core/logger/LoggerService.js';

/**
 * Security Service for Hashing, Encryption and Local Storage protection
 */
export class SecurityService {
  static hashPin(pin) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(pin, salt);
  }

  static verifyPin(pin, hashedPin) {
    if (!pin || !hashedPin) return false;
    return bcrypt.compareSync(pin, hashedPin);
  }

  static encryptData(data, secretKey = 'GMAO_SECURE_KEY') {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    } catch (e) {
      Logger.error('Encryption error:', e, 'SecurityService');
      return null;
    }
  }

  static decryptData(ciphertext, secretKey = 'GMAO_SECURE_KEY') {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedData ? JSON.parse(decryptedData) : null;
    } catch (e) {
      Logger.error('Decryption error:', e, 'SecurityService');
      return null;
    }
  }
}
