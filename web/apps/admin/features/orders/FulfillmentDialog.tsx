'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFulfillOrder } from '@ecomify/api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Input,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@ecomify/ui';
import type { Order, FulfillmentInput } from '@ecomify/types';

/**
 * Fulfillment Dialog Component - Modal/Dialog Pattern
 * Handles order fulfillment with tracking information
 */

interface FulfillmentDialogProps {
  order: Order;
  open: boolean;
  onClose: () => void;
}

interface FulfillmentFormData {
  lineItems: { lineItemId: string; quantity: number }[];
  trackingNumber: string;
  carrier: string;
  notifyCustomer: boolean;
}

export function FulfillmentDialog({ order, open, onClose }: FulfillmentDialogProps) {
  const { toast } = useToast();
  const { mutate: fulfillOrder, isPending } = useFulfillOrder();

  const [formData, setFormData] = useState<FulfillmentFormData>({
    lineItems: order.lineItems.map((item) => ({
      lineItemId: item.id,
      quantity: item.fulfillableQuantity,
    })),
    trackingNumber: '',
    carrier: '',
    notifyCustomer: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fulfillmentData: FulfillmentInput = {
      lineItems: formData.lineItems.filter((item) => item.quantity > 0),
      trackingNumber: formData.trackingNumber || undefined,
      carrier: formData.carrier || undefined,
      notifyCustomer: formData.notifyCustomer,
    };

    if (fulfillmentData.lineItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one item to fulfill',
        variant: 'destructive',
      });
      return;
    }

    fulfillOrder(
      { id: order.id, data: fulfillmentData },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Order fulfilled successfully',
          });
          onClose();
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error?.message || 'Failed to fulfill order',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const updateLineItemQuantity = (lineItemId: string, quantity: number) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.map((item) =>
        item.lineItemId === lineItemId ? { ...item, quantity } : item
      ),
    });
  };

  const toggleLineItem = (lineItemId: string, checked: boolean) => {
    const lineItem = order.lineItems.find((item) => item.id === lineItemId);
    if (lineItem) {
      updateLineItemQuantity(lineItemId, checked ? lineItem.fulfillableQuantity : 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fulfill Order {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items to Fulfill */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Items to Fulfill</Label>
            <div className="border rounded-lg divide-y">
              {order.lineItems.map((item) => {
                const currentQuantity = formData.lineItems.find(
                  (li) => li.lineItemId === item.id
                )?.quantity || 0;

                return (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    <Checkbox
                      checked={currentQuantity > 0}
                      onCheckedChange={(checked) =>
                        toggleLineItem(item.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.variantTitle && (
                        <div className="text-sm text-muted-foreground">
                          {item.variantTitle}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={item.fulfillableQuantity}
                        value={currentQuantity}
                        onChange={(e) =>
                          updateLineItemQuantity(item.id, parseInt(e.target.value) || 0)
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        of {item.fulfillableQuantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Tracking Information</Label>

            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                placeholder="Enter tracking number"
                value={formData.trackingNumber}
                onChange={(e) =>
                  setFormData({ ...formData, trackingNumber: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Select
                value={formData.carrier}
                onValueChange={(value) =>
                  setFormData({ ...formData, carrier: value })
                }
              >
                <SelectTrigger id="carrier">
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="usps">USPS</SelectItem>
                  <SelectItem value="dhl">DHL</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notification Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyCustomer"
              checked={formData.notifyCustomer}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notifyCustomer: checked as boolean })
              }
            />
            <Label htmlFor="notifyCustomer" className="cursor-pointer">
              Send shipment details to customer
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Fulfilling...' : 'Fulfill Items'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
