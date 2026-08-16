import mongoose from 'mongoose';

import type { Post } from './post.interfaces';

const postSchema = new mongoose.Schema<Post>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    kind: {
      type: String,
      required: true,
      enum: ['donation', 'request'],
    },
    locationApprox: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'completed', 'paused'],
      default: 'available',
    },
    tags: {
      type: [String],
      default: [],
      set: (value: string[]) =>
        value.map(tag => String(tag).trim().toLowerCase()).filter(Boolean).slice(0, 10),
    },
    authorId: {
      type: String,
      required: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
