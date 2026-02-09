export type AppointmentStatus = 'pending' | 'completed' | 'overdue';

export interface Appointment {
  id: number;
  clinic: string;
  department: string;
  scheduledAt: string; // ISO string
  remindAt?: string;
  status: AppointmentStatus;
  note?: string;
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
