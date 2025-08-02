
import { db } from '../db';
import { contactSubmissionsTable } from '../db/schema';
import { type CreateContactSubmissionInput, type ContactSubmission } from '../schema';

export const submitContactForm = async (input: CreateContactSubmissionInput): Promise<ContactSubmission> => {
  try {
    // Insert contact submission record
    const result = await db.insert(contactSubmissionsTable)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        service_type: input.service_type,
        message: input.message,
        is_emergency: input.is_emergency,
        status: 'new' // Default status for new submissions
      })
      .returning()
      .execute();

    const submission = result[0];
    return submission;
  } catch (error) {
    console.error('Contact form submission failed:', error);
    throw error;
  }
};
