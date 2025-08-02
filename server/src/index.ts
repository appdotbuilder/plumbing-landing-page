
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createServiceInputSchema, 
  createTestimonialInputSchema,
  createContactSubmissionInputSchema,
  updateBusinessInfoInputSchema
} from './schema';

import { getServices } from './handlers/get_services';
import { createService } from './handlers/create_service';
import { getTestimonials } from './handlers/get_testimonials';
import { getFeaturedTestimonials } from './handlers/get_featured_testimonials';
import { createTestimonial } from './handlers/create_testimonial';
import { submitContactForm } from './handlers/submit_contact_form';
import { getContactSubmissions } from './handlers/get_contact_submissions';
import { getBusinessInfo } from './handlers/get_business_info';
import { updateBusinessInfo } from './handlers/update_business_info';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Services endpoints
  getServices: publicProcedure
    .query(() => getServices()),
  createService: publicProcedure
    .input(createServiceInputSchema)
    .mutation(({ input }) => createService(input)),
  
  // Testimonials endpoints
  getTestimonials: publicProcedure
    .query(() => getTestimonials()),
  getFeaturedTestimonials: publicProcedure
    .query(() => getFeaturedTestimonials()),
  createTestimonial: publicProcedure
    .input(createTestimonialInputSchema)
    .mutation(({ input }) => createTestimonial(input)),
  
  // Contact endpoints
  submitContactForm: publicProcedure
    .input(createContactSubmissionInputSchema)
    .mutation(({ input }) => submitContactForm(input)),
  getContactSubmissions: publicProcedure
    .query(() => getContactSubmissions()),
  
  // Business info endpoints
  getBusinessInfo: publicProcedure
    .query(() => getBusinessInfo()),
  updateBusinessInfo: publicProcedure
    .input(updateBusinessInfoInputSchema)
    .mutation(({ input }) => updateBusinessInfo(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
