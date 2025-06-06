import { ErrorResponse } from "./auth.types";

interface MessageSender {
    id: string;
    name: string;
    avatar: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: MessageSender;
    conversationId: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
    status?: 'sending' | 'failed' | 'sent';
}

export type getMessagesResponse = Message[] | ErrorResponse

export type sendMessageResponse = Message | ErrorResponse