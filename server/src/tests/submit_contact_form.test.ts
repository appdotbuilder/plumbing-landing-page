
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactSubmissionsTable } from '../db/schema';
import { type CreateContactSubmissionInput } from '../schema';
import { submitContactForm } from '../handlers/submit_contact_form';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateContactSubmissionInput = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-123-4567',
  service_type: 'Plumbing Repair',
  message: 'Need help with a leaking pipe',
  is_emergency: false
};

// Emergency test input
const emergencyInput: CreateContactSubmissionInput = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '555-987-6543',
  service_type: 'Emergency Plumbing',
  message: 'Burst pipe flooding basement!',
  is_emergency: true
};

describe('submitContactForm', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact submission', async () => {
    const result = await submitContactForm(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john@example.com');
    expect(result.phone).toEqual('555-123-4567');
    expect(result.service_type).toEqual('Plumbing Repair');
    expect(result.message).toEqual('Need help with a leaking pipe');
    expect(result.is_emergency).toEqual(false);
    expect(result.status).toEqual('new');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save contact submission to database', async () => {
    const result = await submitContactForm(testInput);

    // Query using proper drizzle syntax
    const submissions = await db.select()
      .from(contactSubmissionsTable)
      .where(eq(contactSubmissionsTable.id, result.id))
      .execute();

    expect(submissions).toHaveLength(1);
    expect(submissions[0].name).toEqual('John Doe');
    expect(submissions[0].email).toEqual('john@example.com');
    expect(submissions[0].phone).toEqual('555-123-4567');
    expect(submissions[0].service_type).toEqual('Plumbing Repair');
    expect(submissions[0].message).toEqual('Need help with a leaking pipe');
    expect(submissions[0].is_emergency).toEqual(false);
    expect(submissions[0].status).toEqual('new');
    expect(submissions[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle emergency submissions', async () => {
    const result = await submitContactForm(emergencyInput);

    // Verify emergency flag is properly set
    expect(result.is_emergency).toEqual(true);
    expect(result.name).toEqual('Jane Smith');
    expect(result.service_type).toEqual('Emergency Plumbing');
    expect(result.message).toEqual('Burst pipe flooding basement!');
    expect(result.status).toEqual('new');

    // Verify it's saved to database correctly
    const submissions = await db.select()
      .from(contactSubmissionsTable)
      .where(eq(contactSubmissionsTable.id, result.id))
      .execute();

    expect(submissions[0].is_emergency).toEqual(true);
  });

  it('should handle null service_type', async () => {
    const inputWithNullService: CreateContactSubmissionInput = {
      ...testInput,
      service_type: null
    };

    const result = await submitContactForm(inputWithNullService);

    expect(result.service_type).toBeNull();
    expect(result.name).toEqual('John Doe');
    expect(result.status).toEqual('new');

    // Verify database storage
    const submissions = await db.select()
      .from(contactSubmissionsTable)
      .where(eq(contactSubmissionsTable.id, result.id))
      .execute();

    expect(submissions[0].service_type).toBeNull();
  });

  it('should set default status to new', async () => {
    const result = await submitContactForm(testInput);

    expect(result.status).toEqual('new');

    // Verify in database
    const submissions = await db.select()
      .from(contactSubmissionsTable)
      .where(eq(contactSubmissionsTable.id, result.id))
      .execute();

    expect(submissions[0].status).toEqual('new');
  });
});
