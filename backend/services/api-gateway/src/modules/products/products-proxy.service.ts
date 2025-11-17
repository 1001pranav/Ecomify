/**
 * Products Proxy Service
 * Forwards requests to Product Service
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ProductsProxyService {
  private readonly logger = new Logger(ProductsProxyService.name);
  private readonly productServiceUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.productServiceUrl =
      process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003';

    this.httpClient = axios.create({
      baseURL: `${this.productServiceUrl}/api/v1`,
      timeout: 15000,
    });

    this.logger.log(`Product Service URL: ${this.productServiceUrl}`);
  }

  /**
   * Forward generic request to Product Service
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
      this.logger.error(`Product Service error: ${status}`, data);
      throw new HttpException(data, status);
    } else if (error.request) {
      this.logger.error('Product Service unavailable');
      throw new HttpException(
        'Product Service unavailable',
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
