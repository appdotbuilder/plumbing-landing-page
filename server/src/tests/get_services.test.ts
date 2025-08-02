
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput } from '../schema';
import { getServices } from '../handlers/get_services';

// Test service inputs
const regularService: CreateServiceInput = {
  name: 'Leak Repair',
  description: 'Fix water leaks in pipes and fixtures',
  icon: 'wrench',
  price_range: '$50-100',
  is_emergency: false
};

const emergencyService: CreateServiceInput = {
  name: 'Emergency Pipe Burst',
  description: '24/7 emergency pipe burst repair',
  icon: 'alert',
  price_range: '$200-500',
  is_emergency: true
};

const contactForQuoteService: CreateServiceInput = {
  name: 'Bathroom Renovation',
  description: 'Complete bathroom plumbing renovation',
  icon: 'home',
  price_range: null,
  is_emergency: false
};

describe('getServices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no services exist', async () => {
    const result = await getServices();
    expect(result).toEqual([]);
  });

  it('should return all services', async () => {
    // Insert test services
    await db.insert(servicesTable).values([
      regularService,
      emergencyService,
      contactForQuoteService
    ]).execute();

    const result = await getServices();

    expect(result).toHaveLength(3);
    expect(result.every(service => service.id)).toBe(true);
    expect(result.every(service => service.created_at instanceof Date)).toBe(true);
  });

  it('should order emergency services first', async () => {
    // Insert services in non-emergency first order
    await db.insert(servicesTable).values([
      regularService,
      emergencyService,
      contactForQuoteService
    ]).execute();

    const result = await getServices();

    // First service should be emergency
    expect(result[0].is_emergency).toBe(true);
    expect(result[0].name).toEqual('Emergency Pipe Burst');

    // Non-emergency services should come after
    const nonEmergencyServices = result.filter(service => !service.is_emergency);
    expect(nonEmergencyServices).toHaveLength(2);
  });

  it('should order services by creation date within same emergency status', async () => {
    // Create two regular services with slight time difference
    await db.insert(servicesTable).values(regularService).execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(servicesTable).values({
      name: 'Drain Cleaning',
      description: 'Professional drain cleaning service',
      icon: 'pipe',
      price_range: '$75-150',
      is_emergency: false
    }).execute();

    const result = await getServices();

    expect(result).toHaveLength(2);
    // Newer service should come first (desc order)
    expect(result[0].name).toEqual('Drain Cleaning');
    expect(result[1].name).toEqual('Leak Repair');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
  });

  it('should handle services with null price_range', async () => {
    await db.insert(servicesTable).values(contactForQuoteService).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(result[0].price_range).toBeNull();
    expect(result[0].name).toEqual('Bathroom Renovation');
  });

  it('should return services with all required fields', async () => {
    await db.insert(servicesTable).values(regularService).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    const service = result[0];
    
    expect(service.id).toBeDefined();
    expect(service.name).toEqual('Leak Repair');
    expect(service.description).toEqual('Fix water leaks in pipes and fixtures');
    expect(service.icon).toEqual('wrench');
    expect(service.price_range).toEqual('$50-100');
    expect(service.is_emergency).toBe(false);
    expect(service.created_at).toBeInstanceOf(Date);
  });
});
