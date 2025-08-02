
import { db } from '../db';
import { businessInfoTable } from '../db/schema';
import { type BusinessInfo } from '../schema';
import { desc } from 'drizzle-orm';

export const getBusinessInfo = async (): Promise<BusinessInfo | null> => {
  try {
    // Get the most recent business info record
    const result = await db.select()
      .from(businessInfoTable)
      .orderBy(desc(businessInfoTable.updated_at))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Business info retrieval failed:', error);
    throw error;
  }
};
