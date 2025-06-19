import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: string;
    avatar?: string | null;
    bio?: string | null;
    portfolio?: string | null;
    sentiment: string;
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
    blockMessage: string;
}

export interface IApplication extends mongoose.Document {
    jobId: mongoose.Types.ObjectId | IJob;
    freelancerId: mongoose.Types.ObjectId | IUser;
    coverLetter: string;
    portfolio: string;
    status: string;
    deliveredWork: string;
    correctionMessage: string;
}

export interface IConversation extends mongoose.Document {
    jobId: mongoose.Types.ObjectId | IJob;
    clientId: mongoose.Types.ObjectId | IUser;
    freelancerId: mongoose.Types.ObjectId | IUser;
    messages: mongoose.Types.ObjectId[] | IMessage[];
    lastMessageAt: Date;
    status: string;
    unreadCount: Map<string, number>;
}

export interface IMessage extends mongoose.Document {
    conversationId: mongoose.Types.ObjectId | IConversation;
    senderId: mongoose.Types.ObjectId | IUser;
    content: string;
    read: boolean;
}


