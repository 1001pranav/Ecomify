/**
 * Stores Proxy Service
 * Forwards requests to Store Service
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class StoresProxyService {
  private readonly logger = new Logger(StoresProxyService.name);
  private readonly storeServiceUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.storeServiceUrl =
      process.env.STORE_SERVICE_URL || 'http://localhost:3002';

    this.httpClient = axios.create({
      baseURL: this.storeServiceUrl,
      timeout: 10000,
    });

    this.logger.log(`Store Service URL: ${this.storeServiceUrl}`);
  }

  async createStore(body: any, authorization: string) {
    try {
      const response = await this.httpClient.post('/stores', body, {
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStore(id: string, authorization: string) {
    try {
      const response = await this.httpClient.get(`/stores/${id}`, {
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStores(ownerId: string, authorization: string) {
    try {
      const response = await this.httpClient.get('/stores', {
        params: { ownerId },
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateStore(id: string, body: any, authorization: string) {
    try {
      const response = await this.httpClient.patch(`/stores/${id}`, body, {
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTheme(id: string, body: any, authorization: string) {
    try {
      const response = await this.httpClient.put(`/stores/${id}/theme`, body, {
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateStatus(id: string, body: any, authorization: string) {
    try {
      const response = await this.httpClient.patch(`/stores/${id}/status`, body, {
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      const { status, data } = error.response;
      this.logger.error(`Store Service error: ${status}`, data);
      throw new HttpException(data, status);
    } else if (error.request) {
      this.logger.error('Store Service unavailable');
      throw new HttpException(
        'Store Service unavailable',
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
