
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessInfoTable } from '../db/schema';
import { type UpdateBusinessInfoInput } from '../schema';
import { updateBusinessInfo } from '../handlers/update_business_info';

const testInput: UpdateBusinessInfoInput = {
  business_name: 'Test Plumbing Co',
  tagline: 'Professional Plumbing Services',
  about_text: 'We are a professional plumbing company with years of experience.',
  phone: '(555) 987-6543',
  email: 'test@plumbing.com',
  address: '456 Test Ave, Test City, TS',
  emergency_phone: '(555) 911-1111',
  years_experience: 20,
  license_number: 'PL-12345'
};

describe('updateBusinessInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new business info when none exists', async () => {
    const result = await updateBusinessInfo(testInput);

    expect(result.business_name).toEqual('Test Plumbing Co');
    expect(result.tagline).toEqual('Professional Plumbing Services');
    expect(result.about_text).toEqual('We are a professional plumbing company with years of experience.');
    expect(result.phone).toEqual('(555) 987-6543');
    expect(result.email).toEqual('test@plumbing.com');
    expect(result.address).toEqual('456 Test Ave, Test City, TS');
    expect(result.emergency_phone).toEqual('(555) 911-1111');
    expect(result.years_experience).toEqual(20);
    expect(result.license_number).toEqual('PL-12345');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create new business info with defaults for missing fields', async () => {
    const partialInput: UpdateBusinessInfoInput = {
      business_name: 'Partial Update Co'
    };

    const result = await updateBusinessInfo(partialInput);

    expect(result.business_name).toEqual('Partial Update Co');
    expect(result.tagline).toEqual('Your Trusted Local Plumber');
    expect(result.phone).toEqual('(555) 123-4567');
    expect(result.email).toEqual('info@reliableplumbing.com');
    expect(result.years_experience).toEqual(15);
    expect(result.emergency_phone).toBeNull();
    expect(result.license_number).toBeNull();
  });

  it('should update existing business info', async () => {
    // First create a business info record
    await db.insert(businessInfoTable)
      .values({
        business_name: 'Original Plumbing',
        tagline: 'Original Tagline',
        about_text: 'Original about text',
        phone: '(555) 000-0000',
        email: 'original@plumbing.com',
        address: 'Original Address',
        emergency_phone: null,
        years_experience: 10,
        license_number: null,
        updated_at: new Date()
      })
      .execute();

    // Now update it
    const updateInput: UpdateBusinessInfoInput = {
      business_name: 'Updated Plumbing Co',
      phone: '(555) 999-8888'
    };

    const result = await updateBusinessInfo(updateInput);

    expect(result.business_name).toEqual('Updated Plumbing Co');
    expect(result.phone).toEqual('(555) 999-8888');
    // Other fields should remain unchanged
    expect(result.tagline).toEqual('Original Tagline');
    expect(result.email).toEqual('original@plumbing.com');
    expect(result.years_experience).toEqual(10);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save business info to database', async () => {
    const result = await updateBusinessInfo(testInput);

    const businessInfos = await db.select()
      .from(businessInfoTable)
      .execute();

    expect(businessInfos).toHaveLength(1);
    expect(businessInfos[0].business_name).toEqual('Test Plumbing Co');
    expect(businessInfos[0].email).toEqual('test@plumbing.com');
    expect(businessInfos[0].years_experience).toEqual(20);
    expect(businessInfos[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const inputWithNulls: UpdateBusinessInfoInput = {
      business_name: 'Test Company',
      emergency_phone: null,
      license_number: null
    };

    const result = await updateBusinessInfo(inputWithNulls);

    expect(result.business_name).toEqual('Test Company');
    expect(result.emergency_phone).toBeNull();
    expect(result.license_number).toBeNull();
  });

  it('should only update the first record when multiple exist', async () => {
    // Create two business info records
    const insertResults = await db.insert(businessInfoTable)
      .values([
        {
          business_name: 'First Company',
          tagline: 'First Tagline',
          about_text: 'First about',
          phone: '(555) 111-1111',
          email: 'first@test.com',
          address: 'First Address',
          years_experience: 5,
          updated_at: new Date()
        },
        {
          business_name: 'Second Company',
          tagline: 'Second Tagline',
          about_text: 'Second about',
          phone: '(555) 222-2222',
          email: 'second@test.com',
          address: 'Second Address',
          years_experience: 10,
          updated_at: new Date()
        }
      ])
      .returning()
      .execute();

    const result = await updateBusinessInfo({ business_name: 'Updated Name' });

    expect(result.business_name).toEqual('Updated Name');

    // Verify only one record was updated (should be the first one by ID)
    const allRecords = await db.select()
      .from(businessInfoTable)
      .execute();

    const updatedRecords = allRecords.filter(record => record.business_name === 'Updated Name');
    const unchangedRecords = allRecords.filter(record => record.business_name !== 'Updated Name');
    
    expect(updatedRecords).toHaveLength(1);
    expect(unchangedRecords).toHaveLength(1);
    expect(allRecords).toHaveLength(2);
    
    // The updated record should be the first one (lowest ID)
    expect(updatedRecords[0].id).toEqual(insertResults[0].id);
    expect(unchangedRecords[0].business_name).toEqual('Second Company');
  });
});
