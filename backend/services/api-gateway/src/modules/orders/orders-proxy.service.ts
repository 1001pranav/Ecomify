/**
 * Orders Proxy Service
 * Forwards requests to Order Service
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class OrdersProxyService {
  private readonly logger = new Logger(OrdersProxyService.name);
  private readonly orderServiceUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.orderServiceUrl =
      process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

    this.httpClient = axios.create({
      baseURL: `${this.orderServiceUrl}/api/v1`,
      timeout: 15000,
    });

    this.logger.log(`Order Service URL: ${this.orderServiceUrl}`);
  }

  /**
   * Forward generic request to Order Service
   */
  async forwardRequest(
    method: string,
    path: string,
    query?: any,
    body?: any,
    authorization?: string,
  ) {
    try {
      const headers: any = {};
      if (authorization) {
        headers.Authorization = authorization;
      }

      const response = await this.httpClient.request({
        method,
        url: path,
        params: query,
        data: body,
        headers,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      const { status, data } = error.response;
      this.logger.error(`Order Service error: ${status}`, data);
      throw new HttpException(data, status);
    } else if (error.request) {
      this.logger.error('Order Service unavailable');
      throw new HttpException(
        'Order Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      this.logger.error('Request error:', error.message);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
