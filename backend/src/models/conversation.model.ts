import mongoose from 'mongoose';
import { IConversation } from '../types/model.types';

const conversationSchema = new mongoose.Schema<IConversation>({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true 
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { 
    virtuals: true,
    transform: function(doc: any, ret: any) {
      delete ret._id;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

conversationSchema.index({ clientId: 1, updatedAt: -1 });
conversationSchema.index({ freelancerId: 1, updatedAt: -1 });

export default mongoose.model('Conversation', conversationSchema);