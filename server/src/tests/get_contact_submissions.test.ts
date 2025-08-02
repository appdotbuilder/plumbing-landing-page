
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactSubmissionsTable } from '../db/schema';
import { type CreateContactSubmissionInput } from '../schema';
import { getContactSubmissions } from '../handlers/get_contact_submissions';

// Test inputs
const regularSubmission: CreateContactSubmissionInput = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-0123',
  service_type: 'Plumbing',
  message: 'Need help with leaky faucet',
  is_emergency: false
};

const emergencySubmission: CreateContactSubmissionInput = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '555-0456',
  service_type: 'Emergency Plumbing',
  message: 'Burst pipe flooding house!',
  is_emergency: true
};

describe('getContactSubmissions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no submissions exist', async () => {
    const result = await getContactSubmissions();
    expect(result).toEqual([]);
  });

  it('should return all contact submissions', async () => {
    // Create test submissions
    await db.insert(contactSubmissionsTable)
      .values([
        {
          ...regularSubmission,
          status: 'new'
        },
        {
          ...emergencySubmission,
          status: 'new'
        }
      ])
      .execute();

    const result = await getContactSubmissions();

    expect(result).toHaveLength(2);
    
    // Verify all required fields are present
    result.forEach(submission => {
      expect(submission.id).toBeDefined();
      expect(submission.name).toBeDefined();
      expect(submission.email).toBeDefined();
      expect(submission.phone).toBeDefined();
      expect(submission.message).toBeDefined();
      expect(typeof submission.is_emergency).toBe('boolean');
      expect(submission.status).toBeDefined();
      expect(submission.created_at).toBeInstanceOf(Date);
    });
  });

  it('should prioritize emergency submissions first', async () => {
    // Create submissions with slight delay to ensure different timestamps
    await db.insert(contactSubmissionsTable)
      .values({
        ...regularSubmission,
        status: 'new'
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(contactSubmissionsTable)
      .values({
        ...emergencySubmission,
        status: 'new'
      })
      .execute();

    const result = await getContactSubmissions();

    expect(result).toHaveLength(2);
    
    // Emergency submission should be first, even though it was created later
    expect(result[0].is_emergency).toBe(true);
    expect(result[0].name).toEqual('Jane Smith');
    expect(result[1].is_emergency).toBe(false);
    expect(result[1].name).toEqual('John Doe');
  });

  it('should order by creation date within same priority level', async () => {
    // Create multiple regular submissions
    const firstSubmission = {
      name: 'First User',
      email: 'first@example.com',
      phone: '555-0001',
      service_type: 'Plumbing',
      message: 'First submission',
      is_emergency: false,
      status: 'new' as const
    };

    const secondSubmission = {
      name: 'Second User',
      email: 'second@example.com',
      phone: '555-0002',
      service_type: 'Plumbing',
      message: 'Second submission',
      is_emergency: false,
      status: 'new' as const
    };

    // Insert first submission
    await db.insert(contactSubmissionsTable)
      .values(firstSubmission)
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Insert second submission
    await db.insert(contactSubmissionsTable)
      .values(secondSubmission)
      .execute();

    const result = await getContactSubmissions();

    expect(result).toHaveLength(2);
    
    // Within same priority (both non-emergency), newer should be first
    expect(result[0].name).toEqual('Second User');
    expect(result[1].name).toEqual('First User');
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
  });

  it('should handle mixed priority levels correctly', async () => {
    // Create submissions in specific order to test sorting
    const submissions = [
      {
        name: 'Regular 1',
        email: 'reg1@example.com',
        phone: '555-0001',
        service_type: 'Plumbing',
        message: 'Regular submission 1',
        is_emergency: false,
        status: 'new' as const
      },
      {
        name: 'Emergency 1',
        email: 'emerg1@example.com',
        phone: '555-0002',
        service_type: 'Emergency',
        message: 'Emergency submission 1',
        is_emergency: true,
        status: 'new' as const
      },
      {
        name: 'Regular 2',
        email: 'reg2@example.com',
        phone: '555-0003',
        service_type: 'Plumbing',
        message: 'Regular submission 2',
        is_emergency: false,
        status: 'new' as const
      },
      {
        name: 'Emergency 2',
        email: 'emerg2@example.com',
        phone: '555-0004',
        service_type: 'Emergency',
        message: 'Emergency submission 2',
        is_emergency: true,
        status: 'new' as const
      }
    ];

    // Insert submissions with delays to ensure different timestamps
    for (const submission of submissions) {
      await db.insert(contactSubmissionsTable)
        .values(submission)
        .execute();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const result = await getContactSubmissions();

    expect(result).toHaveLength(4);
    
    // Should have emergency submissions first (newest emergency first)
    expect(result[0].is_emergency).toBe(true);
    expect(result[0].name).toEqual('Emergency 2'); // Newest emergency
    expect(result[1].is_emergency).toBe(true);
    expect(result[1].name).toEqual('Emergency 1'); // Older emergency
    
    // Then regular submissions (newest regular first)
    expect(result[2].is_emergency).toBe(false);
    expect(result[2].name).toEqual('Regular 2'); // Newest regular
    expect(result[3].is_emergency).toBe(false);
    expect(result[3].name).toEqual('Regular 1'); // Oldest regular
  });
});
