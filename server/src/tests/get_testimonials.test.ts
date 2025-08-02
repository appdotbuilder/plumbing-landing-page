
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type CreateTestimonialInput } from '../schema';
import { getTestimonials } from '../handlers/get_testimonials';

// Test data
const testTestimonials: CreateTestimonialInput[] = [
  {
    customer_name: 'John Smith',
    rating: 5,
    review_text: 'Excellent service! Very professional.',
    location: 'Downtown',
    service_type: 'Plumbing repair',
    is_featured: true
  },
  {
    customer_name: 'Sarah Johnson',
    rating: 4,
    review_text: 'Good work, would recommend.',
    location: 'Suburbs',
    service_type: 'Installation',
    is_featured: false
  },
  {
    customer_name: 'Mike Davis',
    rating: 5,
    review_text: 'Outstanding emergency service!',
    location: null,
    service_type: null,
    is_featured: false
  }
];

describe('getTestimonials', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no testimonials exist', async () => {
    const result = await getTestimonials();
    expect(result).toEqual([]);
  });

  it('should fetch all testimonials', async () => {
    // Insert test testimonials
    await db.insert(testimonialsTable)
      .values(testTestimonials)
      .execute();

    const result = await getTestimonials();

    expect(result).toHaveLength(3);
    
    // Verify all testimonials are returned with correct data
    const names = result.map(t => t.customer_name);
    expect(names).toContain('John Smith');
    expect(names).toContain('Sarah Johnson');
    expect(names).toContain('Mike Davis');

    // Verify structure
    result.forEach(testimonial => {
      expect(testimonial.id).toBeDefined();
      expect(testimonial.customer_name).toBeDefined();
      expect(testimonial.rating).toBeGreaterThanOrEqual(1);
      expect(testimonial.rating).toBeLessThanOrEqual(5);
      expect(testimonial.review_text).toBeDefined();
      expect(testimonial.created_at).toBeInstanceOf(Date);
      expect(typeof testimonial.is_featured).toBe('boolean');
    });
  });

  it('should order testimonials by featured status first, then by rating', async () => {
    // Insert testimonials with specific ordering expectations
    await db.insert(testimonialsTable)
      .values([
        {
          customer_name: 'Regular Customer',
          rating: 5,
          review_text: 'Great service',
          location: null,
          service_type: null,
          is_featured: false
        },
        {
          customer_name: 'Featured Customer',
          rating: 4,
          review_text: 'Very good',
          location: 'City Center',
          service_type: 'Emergency',
          is_featured: true
        },
        {
          customer_name: 'Another Regular',
          rating: 3,
          review_text: 'Decent work',
          location: null,
          service_type: null,
          is_featured: false
        }
      ])
      .execute();

    const result = await getTestimonials();

    expect(result).toHaveLength(3);
    
    // First should be featured testimonial
    expect(result[0].customer_name).toBe('Featured Customer');
    expect(result[0].is_featured).toBe(true);
    
    // Among non-featured, higher rating should come first
    expect(result[1].customer_name).toBe('Regular Customer');
    expect(result[1].rating).toBe(5);
    expect(result[1].is_featured).toBe(false);
    
    expect(result[2].customer_name).toBe('Another Regular');
    expect(result[2].rating).toBe(3);
    expect(result[2].is_featured).toBe(false);
  });

  it('should handle nullable fields correctly', async () => {
    await db.insert(testimonialsTable)
      .values({
        customer_name: 'Test Customer',
        rating: 4,
        review_text: 'Good service',
        location: null,
        service_type: null,
        is_featured: false
      })
      .execute();

    const result = await getTestimonials();

    expect(result).toHaveLength(1);
    expect(result[0].location).toBeNull();
    expect(result[0].service_type).toBeNull();
  });
});
