import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../src/payments/payments.service';
import { PrismaService } from '../src/database/prisma.service';
import { EventPublisher } from '../src/events/event-publisher.service';
import { PaymentGatewayFactory } from '../src/payments/strategies/payment-gateway.factory';
import { TransactionType, TransactionStatus } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let eventPublisher: EventPublisher;
  let gatewayFactory: PaymentGatewayFactory;

  const mockPrisma = {
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockEventPublisher = {
    publish: jest.fn(),
  };

  const mockGateway = {
    createIntent: jest.fn(),
    capturePayment: jest.fn(),
    refundPayment: jest.fn(),
  };

  const mockGatewayFactory = {
    getGateway: jest.fn().mockReturnValue(mockGateway),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventPublisher, useValue: mockEventPublisher },
        { provide: PaymentGatewayFactory, useValue: mockGatewayFactory },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    eventPublisher = module.get<EventPublisher>(EventPublisher);
    gatewayFactory = module.get<PaymentGatewayFactory>(PaymentGatewayFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIntent', () => {
    it('should create a payment intent successfully', async () => {
      const dto = {
        orderId: 'order-123',
        storeId: 'store-123',
        amount: 100,
        currency: 'USD',
      };

      const mockIntent = {
        id: 'pi_123',
        clientSecret: 'secret_123',
        amount: 100,
        currency: 'USD',
        status: 'requires_capture',
      };

      const mockTransaction = {
        id: 'txn-123',
        orderId: dto.orderId,
        storeId: dto.storeId,
        gateway: 'stripe',
        type: TransactionType.AUTHORIZATION,
        status: TransactionStatus.PENDING,
        amount: dto.amount,
        currency: dto.currency,
        gatewayTransactionId: mockIntent.id,
      };

      mockGateway.createIntent.mockResolvedValue(mockIntent);
      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.createIntent(dto);

      expect(result.transactionId).toBe('txn-123');
      expect(result.clientSecret).toBe('secret_123');
      expect(result.intentId).toBe('pi_123');
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'payment.intent.created',
        expect.any(Object)
      );
    });
  });

  describe('capturePayment', () => {
    it('should capture a payment successfully', async () => {
      const dto = { intentId: 'pi_123' };

      const mockAuthTransaction = {
        id: 'txn-123',
        orderId: 'order-123',
        storeId: 'store-123',
        gateway: 'stripe',
        type: TransactionType.AUTHORIZATION,
        status: TransactionStatus.PENDING,
        amount: 100,
        currency: 'USD',
        gatewayTransactionId: 'pi_123',
      };

      const mockCaptureResult = {
        success: true,
        transactionId: 'pi_123',
        amount: 100,
        currency: 'USD',
        status: 'succeeded',
        rawResponse: {},
      };

      const mockCaptureTransaction = {
        id: 'txn-capture-123',
        orderId: 'order-123',
        storeId: 'store-123',
        gateway: 'stripe',
        type: TransactionType.CAPTURE,
        status: TransactionStatus.SUCCESS,
        amount: 100,
        currency: 'USD',
      };

      mockPrisma.transaction.findFirst.mockResolvedValue(mockAuthTransaction);
      mockGateway.capturePayment.mockResolvedValue(mockCaptureResult);
      mockPrisma.transaction.create.mockResolvedValue(mockCaptureTransaction);
      mockPrisma.transaction.update.mockResolvedValue({});

      const result = await service.capturePayment(dto);

      expect(result.id).toBe('txn-capture-123');
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'payment.captured',
        expect.any(Object)
      );
    });
  });

  describe('createRefund', () => {
    it('should create a refund successfully', async () => {
      const dto = {
        transactionId: 'txn-123',
        amount: 50,
        reason: 'Customer request',
      };

      const mockOriginalTransaction = {
        id: 'txn-123',
        orderId: 'order-123',
        storeId: 'store-123',
        gateway: 'stripe',
        type: TransactionType.CAPTURE,
        status: TransactionStatus.SUCCESS,
        amount: 100,
        currency: 'USD',
        gatewayTransactionId: 'pi_123',
      };

      const mockRefundResult = {
        success: true,
        refundId: 'ref_123',
        amount: 50,
        status: 'succeeded',
        rawResponse: {},
      };

      const mockRefundTransaction = {
        id: 'txn-refund-123',
        orderId: 'order-123',
        storeId: 'store-123',
        gateway: 'stripe',
        type: TransactionType.REFUND,
        status: TransactionStatus.SUCCESS,
        amount: 50,
        currency: 'USD',
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(mockOriginalTransaction);
      mockGateway.refundPayment.mockResolvedValue(mockRefundResult);
      mockPrisma.transaction.create.mockResolvedValue(mockRefundTransaction);

      const result = await service.createRefund(dto);

      expect(result.id).toBe('txn-refund-123');
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'payment.refunded',
        expect.any(Object)
      );
    });
  });
});
