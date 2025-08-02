
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type Testimonial } from '../schema';
import { desc } from 'drizzle-orm';

export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    // Fetch all testimonials ordered by featured status first, then by rating (highest first)
    const results = await db.select()
      .from(testimonialsTable)
      .orderBy(desc(testimonialsTable.is_featured), desc(testimonialsTable.rating))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    throw error;
  }
};
