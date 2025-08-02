
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type Testimonial } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const results = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.is_featured, true))
      .orderBy(desc(testimonialsTable.rating), desc(testimonialsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch featured testimonials:', error);
    throw error;
  }
};
