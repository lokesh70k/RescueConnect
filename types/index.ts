// In your types/index.ts file

export type Incident = {
  id: string;
  name?: string;
  title: string; // ✅ Corrected and made required
  status: 'NEW' | 'PENDING' | 'DONE' | 'ATTENDING' | string;
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
