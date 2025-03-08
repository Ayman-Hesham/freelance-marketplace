import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: string;
    profilePicture?: string;
    bio?: string;
    portfolio?: Buffer;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [15, 'Name must be less than 15 characters'],
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
    profilePicture: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: null,
    },
    portfolio: {
        type: Buffer,
        default: null,
    },
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
