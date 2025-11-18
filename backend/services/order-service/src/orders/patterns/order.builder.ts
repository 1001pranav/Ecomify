import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Builder Pattern - Order Builder
 * Provides a fluent interface for constructing complex Order objects
 * Handles calculation of totals and validation
 */
@Injectable()
export class OrderBuilder {
  private order: any = {};
  private lineItems: any[] = [];

  setOrderNumber(orderNumber: string): this {
    this.order.orderNumber = orderNumber;
    return this;
  }

  setStoreId(storeId: string): this {
    this.order.storeId = storeId;
    return this;
  }

  setCustomerId(customerId: string): this {
    this.order.customerId = customerId;
    return this;
  }

  setEmail(email: string): this {
    this.order.email = email;
    return this;
  }

  setPhone(phone: string): this {
    this.order.phone = phone;
    return this;
  }

  setShippingAddress(address: any): this {
    this.order.shippingAddress = address;
    return this;
  }

  setBillingAddress(address: any): this {
    this.order.billingAddress = address;
    return this;
  }

  setCurrency(currency: string): this {
    this.order.currency = currency;
    return this;
  }

  setNote(note: string): this {
    this.order.note = note;
    return this;
  }

  setTags(tags: string[]): this {
    this.order.tags = tags;
    return this;
  }

  addLineItem(lineItem: {
    variantId: string;
    title: string;
    variantTitle?: string;
    sku?: string;
    quantity: number;
    price: number;
  }): this {
    const totalPrice = lineItem.price * lineItem.quantity;
    this.lineItems.push({
      ...lineItem,
      totalPrice: new Decimal(totalPrice),
      price: new Decimal(lineItem.price),
    });
    return this;
  }

  setLineItems(lineItems: any[]): this {
    this.lineItems = lineItems.map(item => ({
      ...item,
      totalPrice: new Decimal(item.price * item.quantity),
      price: new Decimal(item.price),
    }));
    return this;
  }

  setShippingCost(shippingCost: number): this {
    this.order.totalShipping = new Decimal(shippingCost);
    return this;
  }

  setTaxAmount(taxAmount: number): this {
    this.order.totalTax = new Decimal(taxAmount);
    return this;
  }

  setDiscountAmount(discountAmount: number): this {
    this.order.totalDiscount = new Decimal(discountAmount);
    return this;
  }

  /**
   * Calculates all totals
   */
  private calculateTotals(): void {
    // Calculate subtotal from line items
    const subtotal = this.lineItems.reduce(
      (sum, item) => sum + parseFloat(item.totalPrice.toString()),
      0
    );

    this.order.subtotalPrice = new Decimal(subtotal);

    // Set defaults if not provided
    if (!this.order.totalTax) {
      this.order.totalTax = new Decimal(0);
    }
    if (!this.order.totalShipping) {
      this.order.totalShipping = new Decimal(0);
    }
    if (!this.order.totalDiscount) {
      this.order.totalDiscount = new Decimal(0);
    }

    // Calculate total: subtotal + tax + shipping - discount
    const total =
      parseFloat(this.order.subtotalPrice.toString()) +
      parseFloat(this.order.totalTax.toString()) +
      parseFloat(this.order.totalShipping.toString()) -
      parseFloat(this.order.totalDiscount.toString());

    this.order.totalPrice = new Decimal(total);
  }

  /**
   * Validates the order data
   */
  private validate(): void {
    if (!this.order.orderNumber) {
      throw new Error('Order number is required');
    }
    if (!this.order.storeId) {
      throw new Error('Store ID is required');
    }
    if (!this.order.email) {
      throw new Error('Email is required');
    }
    if (!this.order.shippingAddress) {
      throw new Error('Shipping address is required');
    }
    if (!this.order.billingAddress) {
      throw new Error('Billing address is required');
    }
    if (this.lineItems.length === 0) {
      throw new Error('At least one line item is required');
    }
  }

  /**
   * Builds and returns the final order object
   */
  build(): any {
    this.validate();
    this.calculateTotals();

    return {
      ...this.order,
      lineItems: {
        create: this.lineItems,
      },
      financialStatus: 'PENDING',
      fulfillmentStatus: 'UNFULFILLED',
    };
  }

  /**
   * Resets the builder for reuse
   */
  reset(): this {
    this.order = {};
    this.lineItems = [];
    return this;
  }
}
