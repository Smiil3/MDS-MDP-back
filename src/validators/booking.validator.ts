import Joi from "joi";

export type BookingIdParamInput = {
  id: number;
};

export type CreateBookingInput = {
  appointment_date: string;
  id_mechanic: number;
  id_booking_status: number;
  id_vehicle?: number;
  service_ids: number[];
};

export type UpdateBookingInput = {
  appointment_date?: string;
  id_booking_status?: number;
  id_vehicle?: number;
};

export const bookingIdParamSchema = Joi.object<BookingIdParamInput>({
  id: Joi.number().integer().required(),
}).required();

export const createBookingSchema = Joi.object<CreateBookingInput>({
  appointment_date: Joi.string().isoDate().required(),
  id_mechanic: Joi.number().integer().positive().required(),
  id_booking_status: Joi.number().integer().positive().required(),
  id_vehicle: Joi.number().integer().positive().optional(),
  service_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
}).required();

export const updateBookingSchema = Joi.object<UpdateBookingInput>({
  appointment_date: Joi.string().isoDate().optional(),
  id_booking_status: Joi.number().integer().positive().optional(),
  id_vehicle: Joi.number().integer().positive().optional(),
}).required();
