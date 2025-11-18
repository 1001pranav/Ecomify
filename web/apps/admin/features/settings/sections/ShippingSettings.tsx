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
  useToast,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ecomify/ui';
import { Plus, Trash2 } from 'lucide-react';

/**
 * ShippingSettings Component
 *
 * Manages shipping zones and rates
 */

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

interface ShippingRate {
  id: string;
  name: string;
  price: number;
  minOrder?: number;
}

export function ShippingSettings() {
  const { toast } = useToast();

  const [zones, setZones] = useState<ShippingZone[]>([
    {
      id: '1',
      name: 'Domestic',
      countries: ['United States'],
      rates: [
        { id: '1', name: 'Standard Shipping', price: 5.99 },
        { id: '2', name: 'Express Shipping', price: 12.99 },
        { id: '3', name: 'Free Shipping', price: 0, minOrder: 50 },
      ],
    },
    {
      id: '2',
      name: 'International',
      countries: ['Canada', 'Mexico'],
      rates: [{ id: '4', name: 'International Standard', price: 15.99 }],
    },
  ]);

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Shipping zones and rates have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      {zones.map((zone) => (
        <Card key={zone.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{zone.name}</CardTitle>
                <CardDescription>
                  {zone.countries.join(', ')}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Edit Zone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rate Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Min. Order</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zone.rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.name}</TableCell>
                    <TableCell>${rate.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {rate.minOrder ? `$${rate.minOrder}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" size="sm" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Rate
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline">
        <Plus className="mr-2 h-4 w-4" />
        Add Shipping Zone
      </Button>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
