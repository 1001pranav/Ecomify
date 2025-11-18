'use client';

import Link from 'next/link';
import { useCustomer } from '@ecomify/api-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@ecomify/ui';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { CustomerStats } from './CustomerStats';
import { CustomerOrderHistory } from './CustomerOrderHistory';
import { AddressDisplay } from '../orders/AddressDisplay';

/**
 * Customer Detail Component - Container/Presentational Pattern
 * Displays comprehensive customer information and order history
 */

interface CustomerDetailProps {
  customerId: string;
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const { data: customer, isLoading } = useCustomer(customerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-2xl font-semibold">Customer not found</div>
        <Link href="/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCustomerName = () => {
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }
    return customer.email;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Customers
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{getCustomerName()}</h1>
          <p className="text-muted-foreground">
            Customer since {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <CustomerStats customer={customer} />

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerOrderHistory customerId={customerId} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm">{customer.email}</div>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-sm">{customer.phone}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Default Address */}
          {customer.defaultAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Default Address</CardTitle>
              </CardHeader>
              <CardContent>
                <AddressDisplay address={customer.defaultAddress} />
              </CardContent>
            </Card>
          )}

          {/* Additional Addresses */}
          {customer.addresses.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Other Addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.addresses
                  .filter((addr) => addr !== customer.defaultAddress)
                  .map((address, index) => (
                    <div key={index}>
                      {index > 0 && <div className="my-3 border-t" />}
                      <AddressDisplay address={address} />
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {customer.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
