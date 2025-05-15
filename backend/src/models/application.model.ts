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
        enum: ['pending', 'in-progress', 'rejected', 'pending approval', 'completed', 'correction'],
        default: 'pending'
    },
    deliveredWork: {
        type: String,
        default: null
    },
    deliveryMessage: {
        type: String,
        default: null
    },
    correctionMessage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});