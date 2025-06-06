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
  unreadCount: number;
  lastMessage: Message[];
  lastMessageAt: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export type getConversationsResponse = Conversation[] | ErrorResponse