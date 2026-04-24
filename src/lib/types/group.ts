import { GroupStatus } from "./status";

export interface ActiveGroup {
  id: string;
  title: string;
  description: string;
  status: GroupStatus;
  category: string;
  basePrice: number;
  groupPrice: number;
  deadline: string;
  participantsCount: number;
  minParticipants?: number;
  maxParticipants?: number;
}