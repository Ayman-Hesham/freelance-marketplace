import mongoose from 'mongoose';
import { IJob } from '../types/model.types';

const jobSchema = new mongoose.Schema<IJob>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    deliveryTime: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Open', 'In-Progress', 'Pending Approval', 'Correction', 'Completed', 'Blocked by Admin'],
        default: 'Open'
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }],
    blockMessage: {
        type: String,
        default: null
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

jobSchema.index({ title: 'text' });
jobSchema.index({ createdAt: -1 });

jobSchema.pre('findOneAndUpdate', function() {
    this.set({ updatedAt: new Date() });
});

const Job = mongoose.model<IJob>('Job', jobSchema);

export default Job;
