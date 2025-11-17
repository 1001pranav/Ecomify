import { Test, TestingModule } from '@nestjs/testing';
import { OrderStateMachineService } from '../src/orders/state/order-state-machine.service';
import { BadRequestException } from '@nestjs/common';

describe('OrderStateMachineService - State Pattern', () => {
  let service: OrderStateMachineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderStateMachineService],
    }).compile();

    service = module.get<OrderStateMachineService>(OrderStateMachineService);
  });

  describe('canTransition', () => {
    it('should allow valid financial status transition', () => {
      const context = {
        financialStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
      };

      expect(service.canTransition(context, 'PAID', undefined)).toBe(true);
    });

    it('should reject invalid financial status transition', () => {
      const context = {
        financialStatus: 'REFUNDED',
        fulfillmentStatus: 'UNFULFILLED',
      };

      expect(service.canTransition(context, 'PAID', undefined)).toBe(false);
    });

    it('should allow valid fulfillment status transition', () => {
      const context = {
        financialStatus: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
      };

      expect(service.canTransition(context, undefined, 'FULFILLED')).toBe(true);
    });

    it('should reject invalid fulfillment status transition', () => {
      const context = {
        financialStatus: 'PAID',
        fulfillmentStatus: 'FULFILLED',
      };

      expect(service.canTransition(context, undefined, 'UNFULFILLED')).toBe(false);
    });
  });

  describe('validateTransition', () => {
    it('should throw BadRequestException for invalid transition', () => {
      const context = {
        financialStatus: 'REFUNDED',
        fulfillmentStatus: 'UNFULFILLED',
      };

      expect(() => {
        service.validateTransition(context, 'PAID', undefined);
      }).toThrow(BadRequestException);
    });

    it('should not throw for valid transition', () => {
      const context = {
        financialStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
      };

      expect(() => {
        service.validateTransition(context, 'PAID', undefined);
      }).not.toThrow();
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for current state', () => {
      const context = {
        financialStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
      };

      const transitions = service.getValidTransitions(context);

      expect(transitions.financialStatus).toContain('PAID');
      expect(transitions.financialStatus).toContain('AUTHORIZED');
      expect(transitions.fulfillmentStatus).toContain('FULFILLED');
    });
  });

  describe('canCancelOrder', () => {
    it('should return true if order can be cancelled', () => {
      const context = {
        financialStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
      };

      expect(service.canCancelOrder(context)).toBe(true);
    });

    it('should return false if order is refunded', () => {
      const context = {
        financialStatus: 'REFUNDED',
        fulfillmentStatus: 'UNFULFILLED',
      };

      expect(service.canCancelOrder(context)).toBe(false);
    });
  });

  describe('canRefundOrder', () => {
    it('should return true if order is paid', () => {
      const context = {
        financialStatus: 'PAID',
        fulfillmentStatus: 'FULFILLED',
      };

      expect(service.canRefundOrder(context)).toBe(true);
    });

    it('should return false if order is pending', () => {
      const context = {
        financialStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
      };

      expect(service.canRefundOrder(context)).toBe(false);
    });
  });
});
