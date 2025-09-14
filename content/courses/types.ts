export type AgendaItem = { 
  title: string; 
  minutes: number; 
  description?: string; 
};

export type Section = { 
  heading: string; 
  body?: string; 
  bullets?: string[]; 
  code?: string; 
  note?: string; 
};

export type LinkItem = { 
  label: string; 
  href: string; 
};

export type Course = {
  slug: string;
  title: string;
  subtitle?: string;
  durationMinutes: number;
  summary: string;
  learningOutcomes: string[];
  agenda: AgendaItem[];
  sections: Section[];
  activities?: Section[];
  resources?: LinkItem[];
  cta?: { label: string; href: string }[];
};
