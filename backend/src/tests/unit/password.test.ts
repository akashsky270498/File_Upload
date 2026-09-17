import { hashPassword, comparePassword } from '../../common/utils/password';

describe('Password Utility Unit Tests', () => {
  it('should hash a raw password into a bcrypt hash string', async () => {
    const rawPassword = 'SecretPassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(rawPassword);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
  });

  it('should return true when comparing correct password with hash', async () => {
    const rawPassword = 'MySecurePassword!';
    const hash = await hashPassword(rawPassword);

    const isValid = await comparePassword(rawPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should return false when comparing incorrect password with hash', async () => {
    const rawPassword = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword123!';
    const hash = await hashPassword(rawPassword);

    const isValid = await comparePassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});

