
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type CreateTestimonialInput } from '../schema';
import { getFeaturedTestimonials } from '../handlers/get_featured_testimonials';

const testTestimonial1: CreateTestimonialInput = {
  customer_name: 'John Smith',
  rating: 5,
  review_text: 'Excellent plumbing service! Fixed my emergency leak quickly.',
  location: 'Downtown',
  service_type: 'Emergency Plumbing',
  is_featured: true
};

const testTestimonial2: CreateTestimonialInput = {
  customer_name: 'Jane Doe',
  rating: 4,
  review_text: 'Professional and reliable. Will use again.',
  location: 'Suburbs',
  service_type: 'Drain Cleaning',
  is_featured: true
};

const testTestimonial3: CreateTestimonialInput = {
  customer_name: 'Bob Wilson',
  rating: 3,
  review_text: 'Good service but not featured.',
  location: 'Midtown',
  service_type: 'Pipe Repair',
  is_featured: false
};

describe('getFeaturedTestimonials', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured testimonials', async () => {
    // Create test testimonials
    await db.insert(testimonialsTable).values([
      testTestimonial1,
      testTestimonial2,
      testTestimonial3
    ]).execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(2);
    expect(result.every(t => t.is_featured === true)).toBe(true);
  });

  it('should order by rating then by created_at descending', async () => {
    // Create testimonials with different ratings and timestamps
    const older = new Date('2023-01-01');
    const newer = new Date('2023-12-01');

    await db.insert(testimonialsTable).values([
      {
        ...testTestimonial1,
        rating: 4,
        created_at: older
      },
      {
        ...testTestimonial2,
        rating: 5,
        created_at: older
      },
      {
        customer_name: 'Alice Brown',
        rating: 5,
        review_text: 'Amazing work!',
        location: 'Uptown',
        service_type: 'Installation',
        is_featured: true,
        created_at: newer
      }
    ]).execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(3);
    // First should be rating 5 with newer date
    expect(result[0].rating).toBe(5);
    expect(result[0].customer_name).toBe('Alice Brown');
    // Second should be rating 5 with older date
    expect(result[1].rating).toBe(5);
    expect(result[1].customer_name).toBe('Jane Doe');
    // Third should be rating 4
    expect(result[2].rating).toBe(4);
    expect(result[2].customer_name).toBe('John Smith');
  });

  it('should return empty array when no featured testimonials exist', async () => {
    // Create only non-featured testimonials
    await db.insert(testimonialsTable).values([
      testTestimonial3
    ]).execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(0);
  });

  it('should return all required fields', async () => {
    await db.insert(testimonialsTable).values([
      testTestimonial1
    ]).execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(1);
    const testimonial = result[0];
    
    expect(testimonial.id).toBeDefined();
    expect(testimonial.customer_name).toBe('John Smith');
    expect(testimonial.rating).toBe(5);
    expect(testimonial.review_text).toBe('Excellent plumbing service! Fixed my emergency leak quickly.');
    expect(testimonial.location).toBe('Downtown');
    expect(testimonial.service_type).toBe('Emergency Plumbing');
    expect(testimonial.is_featured).toBe(true);
    expect(testimonial.created_at).toBeInstanceOf(Date);
  });
});
