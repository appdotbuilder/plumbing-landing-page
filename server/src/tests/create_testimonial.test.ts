
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type CreateTestimonialInput } from '../schema';
import { createTestimonial } from '../handlers/create_testimonial';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTestimonialInput = {
  customer_name: 'John Smith',
  rating: 5,
  review_text: 'Excellent service! Very professional and quick response.',
  location: 'Austin, TX',
  service_type: 'Plumbing Repair',
  is_featured: true
};

describe('createTestimonial', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a testimonial', async () => {
    const result = await createTestimonial(testInput);

    // Basic field validation
    expect(result.customer_name).toEqual('John Smith');
    expect(result.rating).toEqual(5);
    expect(result.review_text).toEqual(testInput.review_text);
    expect(result.location).toEqual('Austin, TX');
    expect(result.service_type).toEqual('Plumbing Repair');
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save testimonial to database', async () => {
    const result = await createTestimonial(testInput);

    // Query using proper drizzle syntax
    const testimonials = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, result.id))
      .execute();

    expect(testimonials).toHaveLength(1);
    expect(testimonials[0].customer_name).toEqual('John Smith');
    expect(testimonials[0].rating).toEqual(5);
    expect(testimonials[0].review_text).toEqual(testInput.review_text);
    expect(testimonials[0].location).toEqual('Austin, TX');
    expect(testimonials[0].service_type).toEqual('Plumbing Repair');
    expect(testimonials[0].is_featured).toEqual(true);
    expect(testimonials[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const inputWithNulls: CreateTestimonialInput = {
      customer_name: 'Jane Doe',
      rating: 4,
      review_text: 'Great work!',
      location: null,
      service_type: null,
      is_featured: false
    };

    const result = await createTestimonial(inputWithNulls);

    expect(result.customer_name).toEqual('Jane Doe');
    expect(result.rating).toEqual(4);
    expect(result.review_text).toEqual('Great work!');
    expect(result.location).toBeNull();
    expect(result.service_type).toBeNull();
    expect(result.is_featured).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create testimonial with different rating values', async () => {
    const lowRatingInput: CreateTestimonialInput = {
      customer_name: 'Bob Wilson',
      rating: 1,
      review_text: 'Not satisfied with the service.',
      location: 'Dallas, TX',
      service_type: 'Emergency Call',
      is_featured: false
    };

    const result = await createTestimonial(lowRatingInput);

    expect(result.rating).toEqual(1);
    expect(result.customer_name).toEqual('Bob Wilson');
    expect(result.review_text).toEqual('Not satisfied with the service.');
    expect(result.is_featured).toEqual(false);
  });
});
