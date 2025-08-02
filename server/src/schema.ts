
import { z } from 'zod';

// Service schema
export const serviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  icon: z.string(), // Icon name or path
  price_range: z.string().nullable(), // e.g., "$100-200" or null for "Contact for quote"
  is_emergency: z.boolean(),
  created_at: z.coerce.date()
});

export type Service = z.infer<typeof serviceSchema>;

// Testimonial schema
export const testimonialSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string(),
  location: z.string().nullable(), // City or area
  service_type: z.string().nullable(), // What service they used
  is_featured: z.boolean(),
  created_at: z.coerce.date()
});

export type Testimonial = z.infer<typeof testimonialSchema>;

// Contact form submission schema
export const contactSubmissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  service_type: z.string().nullable(),
  message: z.string(),
  is_emergency: z.boolean(),
  status: z.enum(['new', 'contacted', 'quoted', 'completed', 'cancelled']),
  created_at: z.coerce.date()
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

// Business info schema
export const businessInfoSchema = z.object({
  id: z.number(),
  business_name: z.string(),
  tagline: z.string(),
  about_text: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  emergency_phone: z.string().nullable(),
  years_experience: z.number().int(),
  license_number: z.string().nullable(),
  updated_at: z.coerce.date()
});

export type BusinessInfo = z.infer<typeof businessInfoSchema>;

// Input schemas for creating/updating
export const createServiceInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  price_range: z.string().nullable(),
  is_emergency: z.boolean()
});

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;

export const createTestimonialInputSchema = z.object({
  customer_name: z.string(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string(),
  location: z.string().nullable(),
  service_type: z.string().nullable(),
  is_featured: z.boolean()
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialInputSchema>;

export const createContactSubmissionInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  service_type: z.string().nullable(),
  message: z.string(),
  is_emergency: z.boolean().default(false)
});

export type CreateContactSubmissionInput = z.infer<typeof createContactSubmissionInputSchema>;

export const updateBusinessInfoInputSchema = z.object({
  business_name: z.string().optional(),
  tagline: z.string().optional(),
  about_text: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergency_phone: z.string().nullable().optional(),
  years_experience: z.number().int().optional(),
  license_number: z.string().nullable().optional()
});

export type UpdateBusinessInfoInput = z.infer<typeof updateBusinessInfoInputSchema>;
