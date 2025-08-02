
import { db } from '../db';
import { businessInfoTable } from '../db/schema';
import { type UpdateBusinessInfoInput, type BusinessInfo } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBusinessInfo = async (input: UpdateBusinessInfoInput): Promise<BusinessInfo> => {
  try {
    // Check if business info record exists
    const existing = await db.select()
      .from(businessInfoTable)
      .limit(1)
      .execute();

    let result;

    if (existing.length > 0) {
      // Update existing record by ID to ensure only one record is updated
      const updateData: Record<string, any> = {};
      
      // Only include fields that were provided in the input
      if (input.business_name !== undefined) updateData['business_name'] = input.business_name;
      if (input.tagline !== undefined) updateData['tagline'] = input.tagline;
      if (input.about_text !== undefined) updateData['about_text'] = input.about_text;
      if (input.phone !== undefined) updateData['phone'] = input.phone;
      if (input.email !== undefined) updateData['email'] = input.email;
      if (input.address !== undefined) updateData['address'] = input.address;
      if (input.emergency_phone !== undefined) updateData['emergency_phone'] = input.emergency_phone;
      if (input.years_experience !== undefined) updateData['years_experience'] = input.years_experience;
      if (input.license_number !== undefined) updateData['license_number'] = input.license_number;
      
      // Always update the timestamp
      updateData['updated_at'] = new Date();

      const updateResult = await db.update(businessInfoTable)
        .set(updateData)
        .where(eq(businessInfoTable.id, existing[0].id))
        .returning()
        .execute();

      result = updateResult[0];
    } else {
      // Create new record with defaults for required fields
      const insertData = {
        business_name: input.business_name || "Reliable Plumbing Services",
        tagline: input.tagline || "Your Trusted Local Plumber",
        about_text: input.about_text || "We provide reliable plumbing services with over 15 years of experience.",
        phone: input.phone || "(555) 123-4567",
        email: input.email || "info@reliableplumbing.com",
        address: input.address || "123 Main St, City, State",
        emergency_phone: input.emergency_phone,
        years_experience: input.years_experience || 15,
        license_number: input.license_number,
        updated_at: new Date()
      };

      const insertResult = await db.insert(businessInfoTable)
        .values(insertData)
        .returning()
        .execute();

      result = insertResult[0];
    }

    return result;
  } catch (error) {
    console.error('Business info update failed:', error);
    throw error;
  }
};
