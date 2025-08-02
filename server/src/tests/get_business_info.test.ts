
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessInfoTable } from '../db/schema';
import { getBusinessInfo } from '../handlers/get_business_info';

describe('getBusinessInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no business info exists', async () => {
    const result = await getBusinessInfo();
    expect(result).toBeNull();
  });

  it('should return business info when it exists', async () => {
    // Create test business info
    const testBusinessInfo = {
      business_name: 'Test Plumbing Co',
      tagline: 'Your trusted plumber',
      about_text: 'We provide excellent plumbing services',
      phone: '555-0123',
      email: 'test@plumbing.com',
      address: '123 Main St, City, State',
      emergency_phone: '555-0456',
      years_experience: 15,
      license_number: 'PL12345'
    };

    await db.insert(businessInfoTable)
      .values(testBusinessInfo)
      .execute();

    const result = await getBusinessInfo();

    expect(result).toBeDefined();
    expect(result?.business_name).toEqual('Test Plumbing Co');
    expect(result?.tagline).toEqual('Your trusted plumber');
    expect(result?.about_text).toEqual('We provide excellent plumbing services');
    expect(result?.phone).toEqual('555-0123');
    expect(result?.email).toEqual('test@plumbing.com');
    expect(result?.address).toEqual('123 Main St, City, State');
    expect(result?.emergency_phone).toEqual('555-0456');
    expect(result?.years_experience).toEqual(15);
    expect(result?.license_number).toEqual('PL12345');
    expect(result?.id).toBeDefined();
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return most recent business info when multiple records exist', async () => {
    // Create first business info record
    await db.insert(businessInfoTable)
      .values({
        business_name: 'Old Business Name',
        tagline: 'Old tagline',
        about_text: 'Old about text',
        phone: '555-0001',
        email: 'old@plumbing.com',
        address: '123 Old St',
        emergency_phone: null,
        years_experience: 10,
        license_number: null
      })
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second (more recent) business info record
    await db.insert(businessInfoTable)
      .values({
        business_name: 'New Business Name',
        tagline: 'New tagline',
        about_text: 'New about text',
        phone: '555-0002',
        email: 'new@plumbing.com',
        address: '456 New St',
        emergency_phone: '555-0789',
        years_experience: 20,
        license_number: 'PL67890'
      })
      .execute();

    const result = await getBusinessInfo();

    expect(result).toBeDefined();
    expect(result?.business_name).toEqual('New Business Name');
    expect(result?.tagline).toEqual('New tagline');
    expect(result?.phone).toEqual('555-0002');
    expect(result?.email).toEqual('new@plumbing.com');
    expect(result?.years_experience).toEqual(20);
  });

  it('should handle nullable fields correctly', async () => {
    // Create business info with null optional fields
    await db.insert(businessInfoTable)
      .values({
        business_name: 'Test Business',
        tagline: 'Test tagline',
        about_text: 'Test about',
        phone: '555-0123',
        email: 'test@example.com',
        address: '123 Test St',
        emergency_phone: null,
        years_experience: 5,
        license_number: null
      })
      .execute();

    const result = await getBusinessInfo();

    expect(result).toBeDefined();
    expect(result?.business_name).toEqual('Test Business');
    expect(result?.emergency_phone).toBeNull();
    expect(result?.license_number).toBeNull();
    expect(result?.years_experience).toEqual(5);
  });
});
