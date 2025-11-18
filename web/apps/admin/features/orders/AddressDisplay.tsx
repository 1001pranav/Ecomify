'use client';

import type { Address } from '@ecomify/types';

/**
 * Address Display Component - Presentational Pattern
 * Displays formatted address information
 */

interface AddressDisplayProps {
  address: Address;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
  return (
    <div className="text-sm space-y-1">
      <div className="font-medium">
        {address.firstName} {address.lastName}
      </div>
      {address.company && <div>{address.company}</div>}
      <div>{address.address1}</div>
      {address.address2 && <div>{address.address2}</div>}
      <div>
        {address.city}, {address.province} {address.zip}
      </div>
      <div>{address.country}</div>
      {address.phone && <div>{address.phone}</div>}
    </div>
  );
}
