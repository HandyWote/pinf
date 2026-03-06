export type AppointmentStatus = 'pending' | 'completed' | 'overdue';

export interface Appointment {
  id: number;
  userId?: number;
  babyId?: number | null;
  clinic: string;
  department: string;
  scheduledAt: string; // ISO string
  remindAt?: string;
  status: AppointmentStatus;
  note?: string;
  createdAt?: string;
  baby?: {
    id: number;
    name: string;
  };
}

export interface CreateAppointmentInput {
  clinic: string;
  department: string;
  scheduledAt: string;
  remindAt?: string;
  status?: AppointmentStatus;
  note?: string;
  babyId?: number;
}

export interface UpdateAppointmentInput {
  clinic?: string;
  department?: string;
  scheduledAt?: string;
  remindAt?: string;
  status?: AppointmentStatus;
  note?: string;
  babyId?: number | null;
}

export interface AppointmentSummaryCounts {
  today: number;
  upcoming: number;
  total: number;
}

export interface AppointmentSummary {
  today: Appointment[];
  upcoming: Appointment[];
  counts: AppointmentSummaryCounts;
  windowDays: number;
  generatedAt: string;
}
