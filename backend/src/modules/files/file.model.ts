import { Schema, model } from 'mongoose';
import { IFile, FileType } from './file.interface';

const fileSchema = new Schema<IFile>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    originalName: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['image', 'video', 'audio', 'pdf'],
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Text Index for Keyword Search & Relevance Scoring
fileSchema.index(
  {
    title: 'text',
    description: 'text',
    tags: 'text',
    originalName: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 5,
      description: 2,
      originalName: 1,
    },
    name: 'FileTextIndex',
  }
);

export const FileModel = model<IFile>('File', fileSchema);

export { IFile, FileType };
