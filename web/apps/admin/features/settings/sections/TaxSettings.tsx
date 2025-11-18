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

/**
 * TaxSettings Component
 *
 * Manages tax configuration
 */

export function TaxSettings() {
  const { toast } = useToast();

  const [taxEnabled, setTaxEnabled] = useState(true);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(false);
  const [defaultTaxRate, setDefaultTaxRate] = useState('8.5');

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Tax settings have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
          <CardDescription>
            Manage tax rates and calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tax-enabled" className="text-base">
                Enable Tax Calculation
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically calculate taxes on orders
              </p>
            </div>
            <Checkbox
              id="tax-enabled"
              checked={taxEnabled}
              onCheckedChange={(checked) => setTaxEnabled(checked as boolean)}
            />
          </div>

          {taxEnabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prices-include-tax" className="text-base">
                    Prices Include Tax
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    All product prices include tax
                  </p>
                </div>
                <Checkbox
                  id="prices-include-tax"
                  checked={pricesIncludeTax}
                  onCheckedChange={(checked) => setPricesIncludeTax(checked as boolean)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-tax-rate">Default Tax Rate (%)</Label>
                <Input
                  id="default-tax-rate"
                  type="number"
                  step="0.1"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(e.target.value)}
                  placeholder="8.5"
                />
                <p className="text-sm text-muted-foreground">
                  Applied when no specific rate is configured
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
