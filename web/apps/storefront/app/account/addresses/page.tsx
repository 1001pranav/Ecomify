'use client';

import { useState } from 'react';
import { Plus, MapPin, Pencil, Trash2, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from '@ecomify/ui';

/**
 * Address Book Page
 * Manage shipping and billing addresses
 */

// Mock addresses
const initialAddresses = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    phone: '+1 (555) 123-4567',
    isDefault: true,
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'Doe',
    address1: '456 Work Avenue',
    address2: 'Suite 100',
    city: 'New York',
    state: 'NY',
    postalCode: '10002',
    country: 'US',
    phone: '+1 (555) 987-6543',
    isDefault: false,
  },
];

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSave = (address: Partial<Address>) => {
    if (editingAddress) {
      // Update existing
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id ? { ...addr, ...address } : addr
        )
      );
    } else {
      // Add new
      const newAddress: Address = {
        id: Date.now().toString(),
        firstName: address.firstName || '',
        lastName: address.lastName || '',
        address1: address.address1 || '',
        address2: address.address2,
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'US',
        phone: address.phone,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }
    setIsDialogOpen(false);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Address Book</h2>
          <p className="text-muted-foreground">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAddress(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>
            <AddressForm
              address={editingAddress}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingAddress(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No addresses saved</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add an address to speed up checkout
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => {
                setEditingAddress(address);
                setIsDialogOpen(true);
              }}
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <Card className={address.isDefault ? 'border-primary' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {address.firstName} {address.lastName}
          </CardTitle>
          {address.isDefault && <Badge>Default</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>{address.address1}</p>
          {address.address2 && <p>{address.address2}</p>}
          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p>{countries.find((c) => c.code === address.country)?.name}</p>
          {address.phone && <p className="mt-2">{address.phone}</p>}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-2 h-3 w-3" />
            Edit
          </Button>
          {!address.isDefault && (
            <>
              <Button variant="outline" size="sm" onClick={onSetDefault}>
                <Check className="mr-2 h-3 w-3" />
                Set Default
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AddressFormProps {
  address: Address | null;
  onSave: (address: Partial<Address>) => void;
  onCancel: () => void;
}

function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState({
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    address1: address?.address1 || '',
    address2: address?.address2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'US',
    phone: address?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address1">Address</Label>
        <Input
          id="address1"
          value={formData.address1}
          onChange={(e) =>
            setFormData({ ...formData, address1: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="address2">Apartment, suite, etc.</Label>
        <Input
          id="address2"
          value={formData.address2}
          onChange={(e) =>
            setFormData({ ...formData, address2: e.target.value })
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({ ...formData, postalCode: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="country">Country</Label>
        <Select
          value={formData.country}
          onValueChange={(value) => setFormData({ ...formData, country: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Address</Button>
      </div>
    </form>
  );
}
