
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';
import type { 
  Service, 
  Testimonial, 
  BusinessInfo, 
  CreateContactSubmissionInput 
} from '../../server/src/schema';

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [isContactFormLoading, setIsContactFormLoading] = useState(false);
  const [contactFormSuccess, setContactFormSuccess] = useState(false);
  const [contactFormData, setContactFormData] = useState<CreateContactSubmissionInput>({
    name: '',
    email: '',
    phone: '',
    service_type: null,
    message: '',
    is_emergency: false
  });

  // Load data on component mount
  const loadData = useCallback(async () => {
    try {
      const [servicesData, testimonialsData, businessData] = await Promise.all([
        trpc.getServices.query(),
        trpc.getFeaturedTestimonials.query(),
        trpc.getBusinessInfo.query()
      ]);
      setServices(servicesData);
      setTestimonials(testimonialsData);
      setBusinessInfo(businessData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsContactFormLoading(true);
    setContactFormSuccess(false);

    try {
      await trpc.submitContactForm.mutate(contactFormData);
      setContactFormSuccess(true);
      // Reset form
      setContactFormData({
        name: '',
        email: '',
        phone: '',
        service_type: null,
        message: '',
        is_emergency: false
      });
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    } finally {
      setIsContactFormLoading(false);
    }
  };

  // Fallback data when backend stubs return empty data
  const defaultBusinessInfo = {
    business_name: "ProFlow Plumbing",
    tagline: "Your Trusted Local Plumbing Experts",
    about_text: "With over 15 years of experience serving the community, we provide reliable, professional plumbing services 24/7. Our licensed technicians are committed to delivering quality workmanship and exceptional customer service.",
    phone: "(555) 123-FLOW",
    email: "info@proflowplumbing.com",
    address: "123 Main Street, Your City, ST 12345",
    emergency_phone: "(555) 911-FLOW",
    years_experience: 15,
    license_number: "PL-2024-001"
  };

  const defaultServices = [
    {
      id: 1,
      name: "Emergency Plumbing",
      description: "24/7 emergency plumbing services for urgent repairs and leaks",
      icon: "🚨",
      price_range: "Contact for quote",
      is_emergency: true
    },
    {
      id: 2,
      name: "Leak Repair", 
      description: "Professional leak detection and repair services for pipes and fixtures",
      icon: "💧",
      price_range: "$150-400",
      is_emergency: false
    },
    {
      id: 3,
      name: "Drain Cleaning",
      description: "Complete drain cleaning and unclogging services for all types of blockages",
      icon: "🔄",
      price_range: "$100-250",
      is_emergency: false
    },
    {
      id: 4,
      name: "Water Heater Services",
      description: "Installation, repair, and maintenance of traditional and tankless water heaters",
      icon: "🔥",
      price_range: "$300-1500",
      is_emergency: false
    }
  ];

  const defaultTestimonials = [
    {
      id: 1,
      customer_name: "Sarah Johnson",
      rating: 5,
      review_text: "Excellent service! They fixed our emergency leak quickly and professionally. Highly recommend!",
      location: "Downtown",
      service_type: "Emergency Repair",
      is_featured: true
    },
    {
      id: 2,
      customer_name: "Mike Chen",
      rating: 5,
      review_text: "Professional team, fair pricing, and quality work. Our new water heater works perfectly.",
      location: "Northside",
      service_type: "Water Heater Installation",
      is_featured: true
    },
    {
      id: 3,
      customer_name: "Lisa Rodriguez",
      rating: 5,
      review_text: "Fast response time and solved our drain problem efficiently. Will call them again!",
      location: "West End",
      service_type: "Drain Cleaning",
      is_featured: true
    }
  ];

  // Use actual data if available, otherwise use fallback data
  const displayBusinessInfo = businessInfo || defaultBusinessInfo;
  const displayServices = services.length > 0 ? services : defaultServices;
  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center mb-6">
            <Wrench className="h-12 w-12 mr-4 text-blue-200" />
            <h1 className="text-5xl md:text-6xl font-bold">
              {displayBusinessInfo.business_name}
            </h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            {displayBusinessInfo.tagline}
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-blue-100">
            Professional plumbing services you can trust. Available 24/7 for emergencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold"
            >
              <PhoneCall className="h-5 w-5 mr-2" />
              Call Now: {displayBusinessInfo.phone}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-200 text-blue-100 hover:bg-blue-800 px-8 py-4 text-lg"
            >
              Request a Quote
            </Button>
          </div>
          {displayBusinessInfo.emergency_phone && (
            <div className="mt-6 p-4 bg-red-600 rounded-lg inline-block">
              <p className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <strong>Emergency Line: {displayBusinessInfo.emergency_phone}</strong>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Plumbing Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From routine maintenance to emergency repairs, we've got you covered with professional plumbing solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {displayServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <span className="text-3xl mr-3">{service.icon}</span>
                    <div>
                      <CardTitle className="text-xl text-gray-800 flex items-center">
                        {service.name}
                        {service.is_emergency && (
                          <Badge variant="destructive" className="ml-2">24/7</Badge>
                        )}
                      </CardTitle>
                      {service.price_range && (
                        <p className="text-blue-600 font-semibold">{service.price_range}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">About {displayBusinessInfo.business_name}</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {displayBusinessInfo.about_text}
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {displayBusinessInfo.years_experience}+
                  </div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    <Shield className="h-8 w-8 mx-auto" />
                  </div>
                  <div className="text-gray-600">Licensed & Insured</div>
                </div>
              </div>

              {displayBusinessInfo.license_number && (
                <p className="text-sm text-gray-500">
                  License #: {displayBusinessInfo.license_number}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                {[
                  "24/7 Emergency Service",
                  "Licensed & Insured Professionals", 
                  "Upfront Pricing - No Hidden Fees",
                  "100% Satisfaction Guarantee",
                  "Local Family-Owned Business",
                  "Latest Equipment & Techniques"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < testimonial.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.review_text}"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-800">{testimonial.customer_name}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      {testimonial.location && (
                        <span className="flex items-center mr-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          {testimonial.location}
                        </span>
                      )}
                      {testimonial.service_type && (
                        <span>{testimonial.service_type}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">
              Ready to solve your plumbing problems? Contact us today!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone</p>
                    <p className="text-gray-600">{displayBusinessInfo.phone}</p>
                    {displayBusinessInfo.emergency_phone && (
                      <p className="text-red-600 font-semibold">
                        Emergency: {displayBusinessInfo.emergency_phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
                    <p className="text-gray-600">{displayBusinessInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Address</p>
                    <p className="text-gray-600">{displayBusinessInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Business Hours</p>
                    <p className="text-gray-600">
                      Mon-Fri: 8:00 AM - 6:00 PM<br />
                      Sat: 9:00 AM - 4:00 PM<br />
                      Sun: Emergency Only
                    </p>
                    <p className="text-red-600 font-semibold mt-1">
                      24/7 Emergency Service Available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contactFormSuccess && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        Thank you! Your message has been sent successfully. We'll get back to you soon.
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Your Name"
                        value={contactFormData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactFormData((prev: CreateContactSubmissionInput) => ({
                            ...prev,
                            name: e.target.value
                          }))
                        }
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={contactFormData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactFormData((prev: CreateContactSubmissionInput) => ({
                            ...prev,
                            email: e.target.value
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        value={contactFormData.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactFormData((prev: CreateContactSubmissionInput) => ({
                            ...prev,
                            phone: e.target.value
                          }))
                        }
                        required
                      />
                      <Input
                        placeholder="Service Type (Optional)"
                        value={contactFormData.service_type || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactFormData((prev: CreateContactSubmissionInput) => ({
                            ...prev,
                            service_type: e.target.value || null
                          }))
                        }
                      />
                    </div>

                    <Textarea
                      placeholder="Describe your plumbing issue..."
                      value={contactFormData.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setContactFormData((prev: CreateContactSubmissionInput) => ({
                          ...prev,
                          message: e.target.value
                        }))
                      }
                      rows={4}
                      required
                    />

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="emergency"
                        checked={contactFormData.is_emergency}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setContactFormData((prev: CreateContactSubmissionInput) => ({
                            ...prev,
                            is_emergency: e.target.checked
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="emergency" className="text-sm text-gray-700">
                        This is an emergency (we'll prioritize your request)
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isContactFormLoading}
                    >
                      {isContactFormLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Wrench className="h-8 w-8 mr-3 text-blue-400" />
                <h3 className="text-2xl font-bold">{displayBusinessInfo.business_name}</h3>
              </div>
              <p className="text-gray-300 mb-4">
                {displayBusinessInfo.tagline}
              </p>
              <p className="text-gray-400 text-sm">
                {displayBusinessInfo.license_number && `License #: ${displayBusinessInfo.license_number}`}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                {displayServices.slice(0, 4).map((service) => (
                  <li key={service.id}>• {service.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {displayBusinessInfo.phone}
                </p>
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {displayBusinessInfo.email}
                </p>
                <p className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  {displayBusinessInfo.address}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-gray-600" />
          
          <div className="text-center text-gray-400">
            <p>&copy; 2024 {displayBusinessInfo.business_name}. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Serving the community with professional plumbing services since {new Date().getFullYear() - displayBusinessInfo.years_experience}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
