export interface Hobby {
  id: number;
  name: string;
  category: string;
  startedAt: string | null;
  entries: HobbyProgressEntry[];
  createdAt: string;
}

export interface HobbyProgressEntry {
  id: number;
  hobbyId: number;
  entryDate: string;
  note: string | null;
  milestone: boolean;
  photoUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
