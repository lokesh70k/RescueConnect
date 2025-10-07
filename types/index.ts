// types/index.ts

export type Incident = {
  id: string;
  status?: 'NEW' | 'PENDING' | 'DONE' | 'ATTENDING' | string;
  tittle?: string;
  title?: string;
  location?: { 
    latitude: number;
    longitude: number; 
  };
  datetime?: any;
  imageurl?: string;
  responderId?: string;
  responderName?: string;
  responderType?: string;
  // ✅ ADDED these boolean flags
  policehelp?: boolean;
  ambulancehelp?: boolean;
  firehelp?: boolean;
  otherhelp?: boolean;
};