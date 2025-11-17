import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../src/orders/orders.service';
import { OrderRepository } from '../src/orders/order.repository';
import { OrderNumberFactory } from '../src/orders/patterns/order-number.factory';
import { OrderBuilder } from '../src/orders/patterns/order.builder';
import { SagaOrchestratorService } from '../src/orders/saga/saga-orchestrator.service';
import { OrderStateMachineService } from '../src/orders/state/order-state-machine.service';
import { EventPublisherService } from '../src/events/event-publisher.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: OrderRepository;
  let orderNumberFactory: OrderNumberFactory;
  let orderBuilder: OrderBuilder;
  let sagaOrchestrator: SagaOrchestratorService;
  let stateMachine: OrderStateMachineService;
  let eventPublisher: EventPublisherService;

  const mockOrder = {
    id: '1',
    orderNumber: 'ORD-20231215-A3F9K2',
    storeId: 'store1',
    email: 'test@example.com',
    financialStatus: 'PENDING',
    fulfillmentStatus: 'UNFULFILLED',
    subtotalPrice: 100,
    totalTax: 10,
    totalShipping: 5,
    totalDiscount: 0,
    totalPrice: 115,
    lineItems: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrderRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByOrderNumber: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
            createRefund: jest.fn(),
            findMany: jest.fn(),
          },
        },
        {
          provide: OrderNumberFactory,
          useValue: {
            generate: jest.fn(),
          },
        },
        {
          provide: OrderBuilder,
          useValue: {
            reset: jest.fn().mockReturnThis(),
            setOrderNumber: jest.fn().mockReturnThis(),
            setStoreId: jest.fn().mockReturnThis(),
            setEmail: jest.fn().mockReturnThis(),
            setShippingAddress: jest.fn().mockReturnThis(),
            setBillingAddress: jest.fn().mockReturnThis(),
            setCurrency: jest.fn().mockReturnThis(),
            addLineItem: jest.fn().mockReturnThis(),
            build: jest.fn(),
          },
        },
        {
          provide: SagaOrchestratorService,
          useValue: {
            executeOrderCreationSaga: jest.fn(),
            executeOrderCancellationSaga: jest.fn(),
          },
        },
        {
          provide: OrderStateMachineService,
          useValue: {
            validateTransition: jest.fn(),
            canCancelOrder: jest.fn(),
            canRefundOrder: jest.fn(),
            getValidTransitions: jest.fn(),
          },
        },
        {
          provide: EventPublisherService,
          useValue: {
            publishOrderCreated: jest.fn(),
            publishOrderStatusChanged: jest.fn(),
            publishOrderCancelled: jest.fn(),
            publishOrderRefunded: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    orderNumberFactory = module.get<OrderNumberFactory>(OrderNumberFactory);
    orderBuilder = module.get<OrderBuilder>(OrderBuilder);
    sagaOrchestrator = module.get<SagaOrchestratorService>(SagaOrchestratorService);
    stateMachine = module.get<OrderStateMachineService>(OrderStateMachineService);
    eventPublisher = module.get<EventPublisherService>(EventPublisherService);
  });

  describe('createOrder', () => {
    it('should create an order using Factory and Builder patterns', async () => {
      const createOrderDto = {
        storeId: 'store1',
        email: 'test@example.com',
        lineItems: [
          {
            variantId: 'var1',
            title: 'Product 1',
            quantity: 2,
            price: 50,
          },
        ],
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          country: 'US',
          zip: '10001',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          country: 'US',
          zip: '10001',
        },
      };

      jest.spyOn(orderNumberFactory, 'generate').mockReturnValue('ORD-20231215-A3F9K2');
      jest.spyOn(orderBuilder, 'build').mockReturnValue(mockOrder);
      jest.spyOn(orderRepository, 'create').mockResolvedValue(mockOrder);
      jest.spyOn(sagaOrchestrator, 'executeOrderCreationSaga').mockResolvedValue({});
      jest.spyOn(eventPublisher, 'publishOrderCreated').mockResolvedValue();

      const result = await service.createOrder(createOrderDto);

      expect(orderNumberFactory.generate).toHaveBeenCalled();
      expect(orderBuilder.build).toHaveBeenCalled();
      expect(orderRepository.create).toHaveBeenCalled();
      expect(sagaOrchestrator.executeOrderCreationSaga).toHaveBeenCalledWith(mockOrder);
      expect(eventPublisher.publishOrderCreated).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findOrderById', () => {
    it('should return an order by ID', async () => {
      jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder);

      const result = await service.findOrderById('1');

      expect(orderRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);

      await expect(service.findOrderById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status using State Pattern', async () => {
      const updateDto = {
        financialStatus: 'PAID' as any,
      };

      jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder);
      jest.spyOn(stateMachine, 'validateTransition').mockReturnValue(undefined);
      jest.spyOn(orderRepository, 'update').mockResolvedValue({
        ...mockOrder,
        financialStatus: 'PAID',
      });
      jest.spyOn(orderRepository, 'createStatusHistory').mockResolvedValue({});
      jest.spyOn(eventPublisher, 'publishOrderStatusChanged').mockResolvedValue();

      const result = await service.updateOrderStatus('1', updateDto);

      expect(stateMachine.validateTransition).toHaveBeenCalled();
      expect(orderRepository.update).toHaveBeenCalledWith('1', {
        financialStatus: 'PAID',
      });
      expect(orderRepository.createStatusHistory).toHaveBeenCalled();
      expect(eventPublisher.publishOrderStatusChanged).toHaveBeenCalled();
      expect(result.financialStatus).toBe('PAID');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order using Saga Pattern', async () => {
      const cancelDto = {
        reason: 'Customer request',
        refund: true,
      };

      jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder);
      jest.spyOn(stateMachine, 'canCancelOrder').mockReturnValue(true);
      jest.spyOn(sagaOrchestrator, 'executeOrderCancellationSaga').mockResolvedValue({});
      jest.spyOn(orderRepository, 'update').mockResolvedValue({
        ...mockOrder,
        financialStatus: 'REFUNDED',
      });
      jest.spyOn(eventPublisher, 'publishOrderCancelled').mockResolvedValue();

      const result = await service.cancelOrder('1', cancelDto);

      expect(stateMachine.canCancelOrder).toHaveBeenCalled();
      expect(sagaOrchestrator.executeOrderCancellationSaga).toHaveBeenCalledWith('1');
      expect(orderRepository.update).toHaveBeenCalled();
      expect(eventPublisher.publishOrderCancelled).toHaveBeenCalled();
    });

    it('should throw BadRequestException if order cannot be cancelled', async () => {
      jest.spyOn(orderRepository, 'findById').mockResolvedValue({
        ...mockOrder,
        financialStatus: 'REFUNDED',
      });
      jest.spyOn(stateMachine, 'canCancelOrder').mockReturnValue(false);

      await expect(
        service.cancelOrder('1', { reason: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createRefund', () => {
    it('should create a refund for an order', async () => {
      const refundDto = {
        amount: 50,
        reason: 'Defective product',
        restockItems: true,
      };

      const mockRefund = {
        id: 'refund1',
        orderId: '1',
        amount: 50,
        reason: 'Defective product',
        restockItems: true,
      };

      jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder);
      jest.spyOn(stateMachine, 'canRefundOrder').mockReturnValue(true);
      jest.spyOn(orderRepository, 'createRefund').mockResolvedValue(mockRefund);
      jest.spyOn(orderRepository, 'update').mockResolvedValue(mockOrder);
      jest.spyOn(eventPublisher, 'publishOrderRefunded').mockResolvedValue();

      const result = await service.createRefund('1', refundDto);

      expect(orderRepository.createRefund).toHaveBeenCalledWith({
        orderId: '1',
        amount: 50,
        reason: 'Defective product',
        restockItems: true,
      });
      expect(eventPublisher.publishOrderRefunded).toHaveBeenCalledWith(mockRefund);
      expect(result).toEqual(mockRefund);
    });
  });

  describe('searchOrders', () => {
    it('should search and filter orders', async () => {
      const searchDto = {
        storeId: 'store1',
        page: 1,
        limit: 20,
      };

      const mockResult = {
        orders: [mockOrder],
        total: 1,
      };

      jest.spyOn(orderRepository, 'findMany').mockResolvedValue(mockResult);

      const result = await service.searchOrders(searchDto as any);

      expect(orderRepository.findMany).toHaveBeenCalled();
      expect(result.orders).toEqual([mockOrder]);
      expect(result.total).toBe(1);
    });
  });
});
