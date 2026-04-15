import Joi from "joi";

export type BookingIdParamInput = {
  id: number;
};

export type CreateBookingInput = {
  appointment_date: string;
  total_amount: number;
  id_mechanic: number;
  id_booking_status: number;
  id_driver: number;
};

export type UpdateBookingInput = Partial<CreateBookingInput>;

export const bookingIdParamSchema = Joi.object<BookingIdParamInput>({
  id: Joi.number().integer().required(),
}).required();

export const createBookingSchema = Joi.object<CreateBookingInput>({
  appointment_date: Joi.string().isoDate().required(),
  total_amount: Joi.number().precision(2).positive().required(),
  id_mechanic: Joi.number().integer().required(),
  id_booking_status: Joi.number().integer().required(),
  id_driver: Joi.number().integer().required(),
}).required();

export const updateBookingSchema = Joi.object<UpdateBookingInput>({
  appointment_date: Joi.string().isoDate().optional(),
  total_amount: Joi.number().precision(2).positive().optional(),
  id_mechanic: Joi.number().integer().optional(),
  id_booking_status: Joi.number().integer().optional(),
  id_driver: Joi.number().integer().optional(),
}).required();
