import { FileType } from '../../infrastructure/postgres/models/file.model';
import { UploadStrategyFactory } from '../../modules/uploads/upload.strategy';
import { ValidationError } from '../../common/errors/app-error';

describe('Upload Strategy Pattern Unit Tests', () => {
  it('should return ProfileImageStrategy for PROFILE_IMAGE uploadType', () => {
    const strategy = UploadStrategyFactory.getStrategy(FileType.PROFILE_IMAGE);
    expect(strategy.cloudinaryFolder).toEqual('profiles');
    expect(strategy.maxSizeBytes).toEqual(5 * 1024 * 1024);
  });

  it('should return VideoStrategy for VIDEO uploadType', () => {
    const strategy = UploadStrategyFactory.getStrategy(FileType.VIDEO);
    expect(strategy.cloudinaryFolder).toEqual('videos');
    expect(strategy.maxSizeBytes).toEqual(100 * 1024 * 1024);
  });

  it('should throw ValidationError if file exceeds max size limit', () => {
    const strategy = UploadStrategyFactory.getStrategy(FileType.PROFILE_IMAGE);
    const oversizedFile = {
      fieldname: 'file',
      originalname: 'avatar.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 10 * 1024 * 1024, // 10MB exceeds 5MB limit
      buffer: Buffer.from('mock'),
    } as Express.Multer.File;

    expect(() => strategy.validate(oversizedFile)).toThrow(ValidationError);
  });

  it('should throw ValidationError if file mime type is not allowed', () => {
    const strategy = UploadStrategyFactory.getStrategy(FileType.PROFILE_IMAGE);
    const invalidMimeFile = {
      fieldname: 'file',
      originalname: 'virus.exe',
      encoding: '7bit',
      mimetype: 'application/x-msdownload',
      size: 1 * 1024 * 1024,
      buffer: Buffer.from('mock'),
    } as Express.Multer.File;

    expect(() => strategy.validate(invalidMimeFile)).toThrow(ValidationError);
  });
});
