
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput } from '../schema';
import { createService } from '../handlers/create_service';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateServiceInput = {
  name: 'Emergency Pipe Repair',
  description: 'Fast 24/7 emergency pipe repair service',
  icon: 'wrench',
  price_range: '$150-300',
  is_emergency: true
};

describe('createService', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a service', async () => {
    const result = await createService(testInput);

    // Basic field validation
    expect(result.name).toEqual('Emergency Pipe Repair');
    expect(result.description).toEqual(testInput.description);
    expect(result.icon).toEqual('wrench');
    expect(result.price_range).toEqual('$150-300');
    expect(result.is_emergency).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save service to database', async () => {
    const result = await createService(testInput);

    // Query using proper drizzle syntax
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, result.id))
      .execute();

    expect(services).toHaveLength(1);
    expect(services[0].name).toEqual('Emergency Pipe Repair');
    expect(services[0].description).toEqual(testInput.description);
    expect(services[0].icon).toEqual('wrench');
    expect(services[0].price_range).toEqual('$150-300');
    expect(services[0].is_emergency).toEqual(true);
    expect(services[0].created_at).toBeInstanceOf(Date);
  });

  it('should create service with null price_range', async () => {
    const inputWithNullPrice: CreateServiceInput = {
      name: 'Custom Plumbing',
      description: 'Contact for custom quote',
      icon: 'phone',
      price_range: null,
      is_emergency: false
    };

    const result = await createService(inputWithNullPrice);

    expect(result.name).toEqual('Custom Plumbing');
    expect(result.price_range).toBeNull();
    expect(result.is_emergency).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, result.id))
      .execute();

    expect(services[0].price_range).toBeNull();
    expect(services[0].is_emergency).toEqual(false);
  });

  it('should create non-emergency service by default', async () => {
    const regularServiceInput: CreateServiceInput = {
      name: 'Regular Maintenance',
      description: 'Scheduled plumbing maintenance',
      icon: 'calendar',
      price_range: '$100-150',
      is_emergency: false
    };

    const result = await createService(regularServiceInput);

    expect(result.is_emergency).toEqual(false);
    expect(result.name).toEqual('Regular Maintenance');
    expect(result.price_range).toEqual('$100-150');
  });
});
