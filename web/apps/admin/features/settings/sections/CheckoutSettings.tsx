'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
  Checkbox,
  Textarea,
  useToast,
} from '@ecomify/ui';

/**
 * CheckoutSettings Component
 *
 * Manages checkout process settings
 */

export function CheckoutSettings() {
  const { toast } = useToast();

  const [guestCheckout, setGuestCheckout] = useState(true);
  const [requirePhone, setRequirePhone] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Checkout settings have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Checkout Options</CardTitle>
          <CardDescription>
            Configure checkout process and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="guest-checkout" className="text-base">
                Allow Guest Checkout
              </Label>
              <p className="text-sm text-muted-foreground">
                Let customers checkout without creating an account
              </p>
            </div>
            <Checkbox
              id="guest-checkout"
              checked={guestCheckout}
              onCheckedChange={(checked) => setGuestCheckout(checked as boolean)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require-phone" className="text-base">
                Require Phone Number
              </Label>
              <p className="text-sm text-muted-foreground">
                Make phone number mandatory at checkout
              </p>
            </div>
            <Checkbox
              id="require-phone"
              checked={requirePhone}
              onCheckedChange={(checked) => setRequirePhone(checked as boolean)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms and Conditions</Label>
            <Textarea
              id="terms"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="Enter your terms and conditions text..."
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Customers must agree to these terms before completing checkout
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
