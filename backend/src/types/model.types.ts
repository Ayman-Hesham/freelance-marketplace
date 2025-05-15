import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: string;
    avatar?: string | null;
    bio?: string | null;
    portfolio?: string | null;
}

export interface IJob extends mongoose.Document {
    title: string;
    description: string;
    budget: number;
    deliveryTime: number;
    status: string;
    clientId: mongoose.Types.ObjectId | IUser;
    freelancerId?: mongoose.Types.ObjectId | IUser;
    applications: mongoose.Types.ObjectId[] | IApplication[];
}

export interface IApplication extends mongoose.Document {
    jobId: mongoose.Types.ObjectId | IJob;
    freelancerId: mongoose.Types.ObjectId | IUser;
    coverLetter: string;
    portfolio: string;
    status: string;
    deliveredWork?: string;
    deliveryMessage?: string;
    correctionMessage?: string;
}
