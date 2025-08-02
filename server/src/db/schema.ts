
import { serial, text, pgTable, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enum for contact submission status
export const contactStatusEnum = pgEnum('contact_status', [
  'new', 'contacted', 'quoted', 'completed', 'cancelled'
]);

export const servicesTable = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(), // Icon name or path
  price_range: text('price_range'), // Nullable for "Contact for quote"
  is_emergency: boolean('is_emergency').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const testimonialsTable = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  review_text: text('review_text').notNull(),
  location: text('location'), // City or area, nullable
  service_type: text('service_type'), // What service they used, nullable
  is_featured: boolean('is_featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const contactSubmissionsTable = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  service_type: text('service_type'), // Nullable
  message: text('message').notNull(),
  is_emergency: boolean('is_emergency').notNull().default(false),
  status: contactStatusEnum('status').notNull().default('new'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const businessInfoTable = pgTable('business_info', {
  id: serial('id').primaryKey(),
  business_name: text('business_name').notNull(),
  tagline: text('tagline').notNull(),
  about_text: text('about_text').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  emergency_phone: text('emergency_phone'), // Nullable
  years_experience: integer('years_experience').notNull(),
  license_number: text('license_number'), // Nullable
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type Service = typeof servicesTable.$inferSelect;
export type NewService = typeof servicesTable.$inferInsert;

export type Testimonial = typeof testimonialsTable.$inferSelect;
export type NewTestimonial = typeof testimonialsTable.$inferInsert;

export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;
export type NewContactSubmission = typeof contactSubmissionsTable.$inferInsert;

export type BusinessInfo = typeof businessInfoTable.$inferSelect;
export type NewBusinessInfo = typeof businessInfoTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  services: servicesTable,
  testimonials: testimonialsTable,
  contactSubmissions: contactSubmissionsTable,
  businessInfo: businessInfoTable
};
