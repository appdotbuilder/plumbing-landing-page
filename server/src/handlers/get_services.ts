
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type Service } from '../schema';
import { desc } from 'drizzle-orm';

export const getServices = async (): Promise<Service[]> => {
  try {
    // Query services ordered by emergency status first, then by creation date (newest first)
    const results = await db.select()
      .from(servicesTable)
      .orderBy(desc(servicesTable.is_emergency), desc(servicesTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    throw error;
  }
};
