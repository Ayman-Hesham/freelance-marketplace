import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: string;
    profilePicture?: string;
    bio?: string;
    portfolioFile?: Buffer;
}

export interface IJob extends mongoose.Document {
    title: string;
    description: string;
    category: string;
    budget: number;
    deliveryDate: number;
    status: string;
    clientId: mongoose.Types.ObjectId | IUser;
    freelancerId?: mongoose.Types.ObjectId | IUser;
    applications?: mongoose.Types.ObjectId[] | IApplication[];
}

export interface IApplication extends mongoose.Document {
    jobId: mongoose.Types.ObjectId | IJob;
    freelancerId: mongoose.Types.ObjectId | IUser;
    coverLetter: string;
    portfolioFile: Buffer;
    status: string;
    deliveredWork?: Buffer;
    deliveryMessage?: string;
    correctionMessage?: string;
}
