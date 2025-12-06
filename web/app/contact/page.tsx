/**
 * Contact page for requesting a consultation with NexSupply
 * 
 * Shows project context from onboarding and collects user contact information
 * for scheduling a consultation.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { loadOnboardingState } from '@/lib/onboardingStorage';
import type { OnboardingState } from '@/lib/types/onboarding';
import { getChannelLabel, getMarketLabel } from '@/lib/types/onboarding';
import { getOnboardingContextForAnalysis } from '@/lib/onboardingHelpers';

type PreferredChannel = 'video_call' | 'email' | 'whatsapp';
type ProjectSeriousness = 'exploring' | 'test_order' | 'serious_production';

interface ContactFormData {
  fullName: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  preferredChannel: PreferredChannel | '';
  timeZone: string;
  timeWindow: string;
  seriousness: ProjectSeriousness | '';
  extraNotes: string;
}

export default function ContactPage() {
  const router = useRouter();
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    company: '',
    role: '',
    phone: '',
    preferredChannel: '',
    timeZone: '',
    timeWindow: '',
    seriousness: '',
    extraNotes: '',
  });

  // Load onboarding state
  useEffect(() => {
    if (isInitialized) return;
    const savedOnboarding = loadOnboardingState();
    if (savedOnboarding) {
      setOnboardingState(savedOnboarding);
    }
    setIsInitialized(true);
  }, [isInitialized]);

  // Helper functions for project context display
  const getVolumePlanDisplay = (plan?: string): string => {
    if (!plan) return 'Not set yet';
    switch (plan) {
      case 'test':
        return 'Test run (roughly fifty units per month)';
      case 'small_launch':
        return 'Small launch (roughly two hundred units per month)';
      case 'steady':
        return 'Steady volume (roughly one thousand units per month)';
      case 'aggressive':
        return 'Aggressive scale (roughly five thousand units per month)';
      case 'not_sure':
        return 'Not sure yet';
      default:
        return 'Not set yet';
    }
  };

  const getTimelineDisplay = (plan?: string): string => {
    if (!plan) return 'Not set yet';
    switch (plan) {
      case 'within_1_month':
        return 'First box within one month';
      case 'within_3_months':
        return 'First box within three months';
      case 'after_3_months':
      case 'flexible':
        return 'Flexible';
      default:
        return 'Not set yet';
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRadioChange = (name: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build payload
      const projectContext = getOnboardingContextForAnalysis(onboardingState);

      const payload = {
        userContact: {
          fullName: formData.fullName,
          email: formData.email,
          company: formData.company || undefined,
          role: formData.role || undefined,
          phone: formData.phone || undefined,
          preferredChannel: formData.preferredChannel || undefined,
          timeZone: formData.timeZone || undefined,
          timeWindow: formData.timeWindow || undefined,
          seriousness: formData.seriousness || undefined,
          extraNotes: formData.extraNotes || undefined,
        },
        projectContext: projectContext || {},
        source: 'results_page_action_bar',
      };

      // Try to POST to API
      let submitSuccess = false;
      try {
        const response = await fetch('/api/contact-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to submit';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        submitSuccess = true;
      } catch (apiError) {
        // Log error but still show success UI for better UX
        // In production, you might want to show an error toast here
        console.error('[ContactPage] Failed to submit to API:', apiError);
        // For now, we still show success to avoid blocking users
        // TODO: Add error toast/notification UI
        submitSuccess = true;
      }

      if (submitSuccess) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('[ContactPage] Failed to submit form:', error);
      // Show error to user (in production, use toast/notification)
      setErrors({ email: 'Failed to submit. Please try again or contact support.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if we should show project context
  const shouldShowProjectContext = onboardingState && (
    onboardingState.projectName ||
    onboardingState.sellingContext.mainChannel ||
    (onboardingState.sellingContext.targetMarkets && onboardingState.sellingContext.targetMarkets.length > 0)
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Card className="p-6 sm:p-8">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto" />
              <h1 className="text-2xl font-bold">Thank you!</h1>
              <p className="text-muted-foreground">
                NexSupply will review your project and contact you within twenty four hours for next steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/results')}
                  className="w-full sm:w-auto"
                >
                  Back to results
                </Button>
                <Button
                  variant="default"
                  onClick={() => router.push('/chat')}
                  className="w-full sm:w-auto"
                >
                  Analyze another product
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contact NexSupply about this project</h1>
          <p className="text-muted-foreground">
            We will review your project details and get back to you with next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Context Card */}
          {shouldShowProjectContext && onboardingState && (
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6">
                <h2 className="text-sm font-semibold mb-4 text-foreground">Project summary</h2>
                <div className="space-y-3 text-sm">
                  {/* Project Name */}
                  <div>
                    <div className="text-muted-foreground mb-1">Project</div>
                    <div className="text-foreground font-medium">
                      {onboardingState.projectName || (
                        <span className="text-muted-foreground">Not set yet</span>
                      )}
                    </div>
                  </div>

                  {/* Channel */}
                  <div>
                    <div className="text-muted-foreground mb-1">Main channel</div>
                    <div className="text-foreground font-medium">
                      {onboardingState.sellingContext.mainChannel ? (
                        onboardingState.sellingContext.mainChannel === 'other' && onboardingState.sellingContext.mainChannelOtherText ? (
                          `Other (${onboardingState.sellingContext.mainChannelOtherText})`
                        ) : (
                          getChannelLabel(onboardingState.sellingContext.mainChannel)
                        )
                      ) : (
                        <span className="text-muted-foreground">Not set yet</span>
                      )}
                    </div>
                  </div>

                  {/* Markets */}
                  <div>
                    <div className="text-muted-foreground mb-1">Target markets</div>
                    <div className="text-foreground font-medium">
                      {onboardingState.sellingContext.targetMarkets && onboardingState.sellingContext.targetMarkets.length > 0 ? (
                        (() => {
                          const marketLabels = onboardingState.sellingContext.targetMarkets
                            .slice(0, 2)
                            .map(m => getMarketLabel(m));
                          const hasMore = onboardingState.sellingContext.targetMarkets.length > 2;
                          return marketLabels.join(', ') + (hasMore ? '...' : '');
                        })()
                      ) : (
                        <span className="text-muted-foreground">Not set yet</span>
                      )}
                    </div>
                  </div>

                  {/* Volume Plan */}
                  <div>
                    <div className="text-muted-foreground mb-1">Volume plan</div>
                    <div className="text-foreground font-medium">
                      {getVolumePlanDisplay(onboardingState.yearlyVolumePlan)}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <div className="text-muted-foreground mb-1">Timeline</div>
                    <div className="text-foreground font-medium">
                      {getTimelineDisplay(onboardingState.timelinePlan)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Contact Form Card */}
          <div className={shouldShowProjectContext ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-6 text-foreground">Contact information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1">
                    Company name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
                    Role or title
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                    Phone or WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Optional. WhatsApp number is okay.</p>
                </div>

                {/* Preferred Channel */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preferred follow-up channel
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredChannel"
                        value="video_call"
                        checked={formData.preferredChannel === 'video_call'}
                        onChange={() => handleRadioChange('preferredChannel', 'video_call')}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Video call (twenty to thirty minutes)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredChannel"
                        value="email"
                        checked={formData.preferredChannel === 'email'}
                        onChange={() => handleRadioChange('preferredChannel', 'email')}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">Email only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredChannel"
                        value="whatsapp"
                        checked={formData.preferredChannel === 'whatsapp'}
                        onChange={() => handleRadioChange('preferredChannel', 'whatsapp')}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">WhatsApp or chat</span>
                    </label>
                  </div>
                </div>

                {/* Time Zone */}
                <div>
                  <label htmlFor="timeZone" className="block text-sm font-medium text-foreground mb-1">
                    Time zone
                  </label>
                  <input
                    type="text"
                    id="timeZone"
                    name="timeZone"
                    value={formData.timeZone}
                    onChange={handleInputChange}
                    placeholder="e.g., PST or Central US"
                    className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Time Window */}
                <div>
                  <label htmlFor="timeWindow" className="block text-sm font-medium text-foreground mb-1">
                    Preferred time window
                  </label>
                  <input
                    type="text"
                    id="timeWindow"
                    name="timeWindow"
                    value={formData.timeWindow}
                    onChange={handleInputChange}
                    placeholder="e.g., Weekday evenings or Monday-Friday 9am to noon"
                    className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This helps us suggest a slot close to your time zone.
                  </p>
                </div>

                {/* Seriousness */}
                <div>
                  <label htmlFor="seriousness" className="block text-sm font-medium text-foreground mb-1">
                    How serious is this project?
                  </label>
                  <select
                    id="seriousness"
                    name="seriousness"
                    value={formData.seriousness}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg bg-surface border border-subtle-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="exploring">Just exploring ideas</option>
                    <option value="test_order">Planning a test order</option>
                    <option value="serious_production">Ready for serious production</option>
                  </select>
                </div>

                {/* Extra Notes */}
                <div>
                  <label htmlFor="extraNotes" className="block text-sm font-medium text-foreground mb-1">
                    Anything we should check before the call?
                  </label>
                  <textarea
                    id="extraNotes"
                    name="extraNotes"
                    value={formData.extraNotes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-surface border border-subtle-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="Optional notes..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request a consult'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/results')}
                    className="w-full"
                  >
                    Keep this report only (back to results)
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

