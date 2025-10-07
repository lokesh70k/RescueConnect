// types/index.ts

export type Incident = {
  id: string;
  name?: string; // ✅ UPDATED THIS LINE
  status: 'NEW' | 'PENDING' | 'DONE' | 'ATTENDING' | string;
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
  policehelp?: boolean;
  ambulancehelp?: boolean;
  firehelp?: boolean;
  otherhelp?: boolean;
};
