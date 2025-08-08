import mongoose from 'mongoose';
import { IApplication } from '../types/model.types';

const applicationSchema = new mongoose.Schema<IApplication>({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        required: true
    },
    portfolio: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'In-Progress', 'Not Selected', 'Pending Approval', 'Completed', 'Correction'],
        default: 'Pending'
    },
    deliveredWork: [{
        type: String,
        default: null
    }],
    correctionMessage: [{
        type: String,
        default: null
    }]
}, {
    timestamps: true
});

applicationSchema.index({ createdAt: 1 });
applicationSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

applicationSchema.pre('findOneAndUpdate', function() {
    this.set({ updatedAt: new Date() });
});

const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application;
