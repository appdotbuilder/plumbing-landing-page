
import { db } from '../db';
import { contactSubmissionsTable } from '../db/schema';
import { type ContactSubmission } from '../schema';
import { desc } from 'drizzle-orm';

export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
    // Query contact submissions, prioritizing emergency requests and ordering by creation date
    const results = await db.select()
      .from(contactSubmissionsTable)
      .orderBy(
        desc(contactSubmissionsTable.is_emergency), // Emergency requests first (true > false)
        desc(contactSubmissionsTable.created_at)    // Then by newest first
      )
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch contact submissions:', error);
    throw error;
  }
};
