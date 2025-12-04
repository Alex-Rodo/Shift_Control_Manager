import { TurnStatus } from "./TurnStatus";

export interface Turn {
  id: string;
  name: string;
  specialty: string;
  createdAt: number;
  status: TurnStatus;
  turnNumber: number; 
}
