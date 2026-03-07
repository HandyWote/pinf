import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  toLocalDateTimePayload,
  formatAppointmentDateTime,
  formatAppointmentDateBadge,
  getAppointmentUrgencyLabel,
  groupAppointments,
} from '../appointment';
import type { Appointment } from '@/types/appointment';

describe('appointment', () => {
  describe('toLocalDateTimePayload', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-15T14:30:00');
      expect(toLocalDateTimePayload(date)).toBe('2024-03-15T14:30:00');
    });

    it('should pad single digits', () => {
      const date = new Date('2024-01-05T08:05:03');
      expect(toLocalDateTimePayload(date)).toBe('2024-01-05T08:05:03');
    });
  });

  describe('formatAppointmentDateTime', () => {
    it('should format datetime correctly', () => {
      const result = formatAppointmentDateTime('2024-03-15T14:30:00');
      expect(result).toBe('3月15日 14:30');
    });

    it('should return original value for invalid date', () => {
      expect(formatAppointmentDateTime('invalid')).toBe('invalid');
    });
  });

  describe('formatAppointmentDateBadge', () => {
    it('should format date badge correctly', () => {
      const result = formatAppointmentDateBadge('2024-03-05T14:30:00');
      expect(result).toEqual({ day: '05', month: '3月' });
    });

    it('should return default for invalid date', () => {
      const result = formatAppointmentDateBadge('invalid');
      expect(result).toEqual({ day: '--', month: '--' });
    });
  });

  describe('getAppointmentUrgencyLabel', () => {
    // Use fixed dates for testing instead of mocking system time
    it('should return "今天" for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(getAppointmentUrgencyLabel(`${today}T10:00:00`)).toBe('今天');
    });

    it('should return "已过期" for past dates', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      expect(getAppointmentUrgencyLabel(`${pastDate}T10:00:00`)).toBe('已过期');
    });

    it('should return "X天内" for upcoming within threshold', () => {
      const upcomingDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const result = getAppointmentUrgencyLabel(`${upcomingDate}T10:00:00`);
      expect(result).toMatch(/\d天内/);
    });

    it('should return "后续" for future dates beyond threshold', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      expect(getAppointmentUrgencyLabel(`${futureDate}T10:00:00`)).toBe('后续');
    });

    it('should return "待确认" for invalid dates', () => {
      expect(getAppointmentUrgencyLabel('invalid')).toBe('待确认');
    });
  });

  describe('groupAppointments', () => {
    const createAppointment = (dateStr: string): Appointment => ({
      id: 1,
      clinic: 'Test Clinic',
      department: 'Test Dept',
      scheduledAt: dateStr,
      status: 'pending',
    });

    it('should group appointments correctly', () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const appointments: Appointment[] = [
        createAppointment(`${today}T10:00:00`), // today
        createAppointment(`${tomorrow}T10:00:00`), // upcoming
        createAppointment(`${nextWeek}T10:00:00`), // later
        createAppointment(`${lastWeek}T10:00:00`), // past
      ];

      const result = groupAppointments(appointments);

      expect(result.today).toHaveLength(1);
      expect(result.upcoming).toHaveLength(1);
      expect(result.later).toHaveLength(1);
      expect(result.past).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const result = groupAppointments([]);
      expect(result.today).toHaveLength(0);
      expect(result.upcoming).toHaveLength(0);
      expect(result.later).toHaveLength(0);
      expect(result.past).toHaveLength(0);
    });

    it('should handle invalid dates', () => {
      const appointments: Appointment[] = [
        { ...createAppointment(new Date().toISOString()), id: 1 },
        { ...createAppointment('invalid'), id: 2 },
      ];

      const result = groupAppointments(appointments);

      // Invalid dates go to 'later' group
      expect(result.later).toHaveLength(1);
    });
  });
});
