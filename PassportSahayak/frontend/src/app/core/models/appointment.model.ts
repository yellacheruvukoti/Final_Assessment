import { ServiceScheme } from './application.model';

export type CenterType = 'PSK' | 'POPSK';
export type AppointmentStatus = 'BOOKED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface CenterResponse {
  id: number;
  code: string;
  name: string;
  type: CenterType;
  city: string;
  state: string;
  address: string;
  dailyCapacity: number;
  tatkalCapacityPercent: number;
}

export interface SlotSearchResponse {
  centerId: number;
  centerName: string;
  city: string;
  date: string;
  category: ServiceScheme;
  capacity: number;
  booked: number;
  available: number;
}

export interface BookAppointmentRequest {
  arn: string;
  centerId: number;
  appointmentDate: string;
  appointmentTime: string;
  category: ServiceScheme;
}

export interface RescheduleRequest {
  newAppointmentDate: string;
  newAppointmentTime: string;
}

export interface AppointmentResponse {
  id: number;
  arn: string;
  centerId: number;
  centerName: string;
  appointmentDate: string;
  appointmentTime: string;
  category: ServiceScheme;
  status: AppointmentStatus;
  rescheduleCount: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CapacityResponse {
  centerId: number;
  centerName: string;
  date: string;
  normalCapacity: number;
  normalBooked: number;
  tatkalCapacity: number;
  tatkalBooked: number;
}
