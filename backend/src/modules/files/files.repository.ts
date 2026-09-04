import { FileModel } from './file.model';
import { IFile, FileQueryOptions } from './file.interface';

export class FileRepository {
  public async createFile(fileData: Partial<IFile>): Promise<IFile> {
    const file = new FileModel(fileData);
    return file.save();
  }

  public async findById(id: string): Promise<IFile | null> {
    return FileModel.findById(id).populate('uploader', 'name email avatarUrl').exec();
  }

  public async findByIdAndIncrementViews(id: string): Promise<IFile | null> {
    return FileModel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }, { new: true })
      .populate('uploader', 'name email avatarUrl')
      .exec();
  }

  public async findFiles(options: FileQueryOptions): Promise<IFile[]> {
    const { filterConditions, sortConditions, skip, limit } = options;
    return FileModel.find(filterConditions)
      .populate('uploader', 'name email avatarUrl')
      .sort(sortConditions)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async countFiles(filterConditions: Record<string, unknown>): Promise<number> {
    return FileModel.countDocuments(filterConditions).exec();
  }

  public async deleteById(id: string): Promise<IFile | null> {
    return FileModel.findByIdAndDelete(id).exec();
  }
}

export const fileRepository = new FileRepository();
