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
  useToast,
} from '@ecomify/ui';
import { CreditCard, Plus } from 'lucide-react';

/**
 * PaymentSettings Component
 *
 * Manages payment gateway configurations
 * Implements Strategy Pattern for different payment providers
 */

interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
}

export function PaymentSettings() {
  const { toast } = useToast();

  const [gateways, setGateways] = useState<PaymentGateway[]>([
    { id: 'stripe', name: 'Stripe', enabled: true, apiKey: 'pk_test_***', secretKey: 'sk_test_***' },
    { id: 'paypal', name: 'PayPal', enabled: false },
    { id: 'square', name: 'Square', enabled: false },
  ]);

  const toggleGateway = (id: string) => {
    setGateways((prev) =>
      prev.map((gateway) =>
        gateway.id === id ? { ...gateway, enabled: !gateway.enabled } : gateway
      )
    );
  };

  const handleSave = () => {
    // TODO: Implement API call to save payment settings
    toast({
      title: 'Settings saved',
      description: 'Payment gateway settings have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>
            Configure payment providers for your store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gateways.map((gateway) => (
            <Card key={gateway.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">{gateway.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {gateway.enabled ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={gateway.enabled}
                      onCheckedChange={() => toggleGateway(gateway.id)}
                    />
                    <span className="text-sm">Enable</span>
                  </div>
                </div>

                {gateway.enabled && gateway.apiKey && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input value={gateway.apiKey} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <Input value={gateway.secretKey} type="password" readOnly />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Gateway
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
