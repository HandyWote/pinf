import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as appointmentApi from '@/services/api/appointment';
import { useAppointmentStore } from '../appointmentStore';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
  },
}));

vi.mock('@/services/api/appointment', () => ({
  listAppointments: vi.fn(),
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  updateAppointmentStatus: vi.fn(),
  deleteAppointment: vi.fn(),
}));

describe('appointmentStore', () => {
  beforeEach(() => {
    useAppointmentStore.getState().clear();
    vi.clearAllMocks();
  });

  it('should update appointment status in place', async () => {
    useAppointmentStore.setState({
      appointments: [
        {
          id: 1,
          clinic: 'Test Clinic',
          department: 'Child Care',
          scheduledAt: '2026-03-07T10:00:00',
          status: 'overdue',
        },
      ],
    });

    vi.mocked(appointmentApi.updateAppointmentStatus).mockResolvedValue({
      id: 1,
      clinic: 'Test Clinic',
      department: 'Child Care',
      scheduledAt: '2026-03-07T10:00:00',
      status: 'completed',
    });

    await useAppointmentStore.getState().updateStatus(1, 'completed');

    expect(appointmentApi.updateAppointmentStatus).toHaveBeenCalledWith(1, 'completed');
    expect(useAppointmentStore.getState().appointments[0].status).toBe('completed');
    expect(useAppointmentStore.getState().loading).toBe(false);
  });

  it('should expose error when updating status fails', async () => {
    vi.mocked(appointmentApi.updateAppointmentStatus).mockRejectedValue(new Error('status failed'));

    await expect(useAppointmentStore.getState().updateStatus(1, 'completed')).rejects.toThrow(
      'status failed'
    );

    expect(useAppointmentStore.getState().error).toBe('status failed');
    expect(useAppointmentStore.getState().loading).toBe(false);
  });
});
