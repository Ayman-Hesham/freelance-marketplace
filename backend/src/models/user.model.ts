import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../types/model.types';

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        maxlength: [254, 'Email cannot exceed 254 characters'],
        validate: {
            validator: (email: string) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Invalid email address',
        },
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ['client', 'freelancer'],
        default: 'client',
    },
    avatar: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: null,
    },
    portfolio: {
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

userSchema.index({ createdAt: -1 });
userSchema.index({ name: 1 });

userSchema.pre('findOneAndUpdate', function() {
    this.set({ updatedAt: new Date() });
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const isBcryptHash = /^\$2[aby]\$\d+\$/.test(this.password);
    
    if (!isBcryptHash) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
