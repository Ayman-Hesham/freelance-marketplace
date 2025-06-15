import { ErrorResponse } from "./auth.types";
import { Message } from "./message.types";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Job {
  id: string;
  title: string;
}

export interface Conversation {
  id: string;
  jobId: Job;
  clientId: User;
  freelancerId: User;
  lastMessage: Message[];
  lastMessageAt: string;
  status: 'active' | 'closed';
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type getConversationsResponse = Conversation[] | ErrorResponse