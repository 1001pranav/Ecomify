'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@ecomify/ui';
import type { CheckoutData } from '../../types/checkout';

/**
 * Information Step - Contact & Shipping Address
 * First step of checkout flow
 */

const informationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  saveInfo: z.boolean().optional(),
});

export type InformationFormValues = z.infer<typeof informationSchema>;

interface InformationStepProps {
  data: Partial<CheckoutData>;
  onNext: (data: InformationFormValues) => void;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
];

export function InformationStep({ data, onNext }: InformationStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InformationFormValues>({
    resolver: zodResolver(informationSchema),
    defaultValues: {
      email: data.email || '',
      phone: data.phone || '',
      firstName: data.shippingAddress?.firstName || '',
      lastName: data.shippingAddress?.lastName || '',
      address1: data.shippingAddress?.address1 || '',
      address2: data.shippingAddress?.address2 || '',
      city: data.shippingAddress?.city || '',
      state: data.shippingAddress?.state || '',
      postalCode: data.shippingAddress?.postalCode || '',
      country: data.shippingAddress?.country || 'US',
      saveInfo: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address1">Address *</Label>
            <Input
              id="address1"
              placeholder="Street address"
              {...register('address1')}
              className={errors.address1 ? 'border-destructive' : ''}
            />
            {errors.address1 && (
              <p className="mt-1 text-sm text-destructive">
                {errors.address1.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
            <Input
              id="address2"
              placeholder="Apt, suite, floor..."
              {...register('address2')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                {...register('state')}
                className={errors.state ? 'border-destructive' : ''}
              />
              {errors.state && (
                <p className="mt-1 text-sm text-destructive">{errors.state.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                className={errors.postalCode ? 'border-destructive' : ''}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.postalCode.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Select
              value={watch('country')}
              onValueChange={(value) => setValue('country', value)}
            >
              <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="mt-1 text-sm text-destructive">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="saveInfo"
              {...register('saveInfo')}
              onCheckedChange={(checked) => setValue('saveInfo', checked as boolean)}
            />
            <Label htmlFor="saveInfo" className="text-sm font-normal">
              Save this information for next time
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Continue to Shipping'}
        </Button>
      </div>
    </form>
  );
}
