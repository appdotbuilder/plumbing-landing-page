
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput, type Service } from '../schema';

export const createService = async (input: CreateServiceInput): Promise<Service> => {
  try {
    // Insert service record
    const result = await db.insert(servicesTable)
      .values({
        name: input.name,
        description: input.description,
        icon: input.icon,
        price_range: input.price_range,
        is_emergency: input.is_emergency
      })
      .returning()
      .execute();

    // Return the created service
    const service = result[0];
    return service;
  } catch (error) {
    console.error('Service creation failed:', error);
    throw error;
  }
};
