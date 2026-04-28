import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { defer, delay, forkJoin, map, of } from 'rxjs';
import { appRuntimeConfig } from '../config/runtime-config';
import { buildDemoHouseInputs } from '../data/demo-house-templates';
import {
  addMockMember,
  createMockApplication,
  createMockCharge,
  createMockHouse,
  getMockHouseById,
  listMockApplicationsByUser,
  listMockHouses,
  listMockPayments,
  updateMockApplicationStatus,
  upsertMockPayment
} from '../data/mock-data';
import type {
  AddMemberInput,
  Application,
  ApplicationListItem,
  CreateApplicationInput,
  CreateChargeInput,
  CreateHouseInput,
  HouseDetail,
  HouseFilters,
  HouseMember,
  HouseSummary,
  MonthlyCharge,
  Payment,
  UpdateApplicationStatusInput,
  UpsertPaymentInput
} from '../models/domain.models';

interface ApiResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = appRuntimeConfig.apiBaseUrl;
  private readonly useMockApi = appRuntimeConfig.useMockApi;

  listHouses(filters: HouseFilters = {}) {
    if (this.useMockApi) {
      return of(listMockHouses(filters)).pipe(delay(120));
    }

    let params = new HttpParams();
    if (filters.city) {
      params = params.set('city', filters.city);
    }
    if (filters.neighborhood?.length) {
      filters.neighborhood.forEach((neighborhood) => {
        params = params.append('neighborhood', neighborhood);
      });
    }
    if (filters.maxPrice) {
      params = params.set('maxPrice', String(filters.maxPrice));
    }

    return this.http.get<ApiResponse<HouseSummary[]>>(`${this.baseUrl}/houses`, this.requestOptions({ params })).pipe(map((response) => response.data));
  }

  getHouseById(houseId: string) {
    if (this.useMockApi) {
      return of(getMockHouseById(houseId));
    }

    return this.http.get<ApiResponse<HouseDetail>>(`${this.baseUrl}/houses/${houseId}`, this.requestOptions()).pipe(map((response) => response.data));
  }

  createHouse(input: CreateHouseInput) {
    if (this.useMockApi) {
      return of(createMockHouse(input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<HouseDetail>>(`${this.baseUrl}/houses`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  seedDemoHouses(ownerId: string) {
    const inputs = buildDemoHouseInputs(ownerId);
    return forkJoin(inputs.map((input) => this.createHouse(input)));
  }

  createApplication(input: CreateApplicationInput) {
    if (this.useMockApi) {
      return of(createMockApplication(input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<Application>>(`${this.baseUrl}/applications`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  listApplicationsByUser(userId: string) {
    if (this.useMockApi) {
      return of(listMockApplicationsByUser(userId)).pipe(delay(120));
    }

    return this.http.get<ApiResponse<ApplicationListItem[]>>(`${this.baseUrl}/applications`, this.requestOptions()).pipe(map((response) => response.data));
  }

  updateApplicationStatus(input: UpdateApplicationStatusInput) {
    if (this.useMockApi) {
      return of(updateMockApplicationStatus(input)).pipe(delay(120));
    }

    return this.http.patch<ApiResponse<Application>>(`${this.baseUrl}/applications/${input.applicationId}`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  addMember(houseId: string, input: AddMemberInput) {
    if (this.useMockApi) {
      return defer(() => of(addMockMember(houseId, input))).pipe(delay(120));
    }

    return this.http.post<ApiResponse<HouseMember>>(`${this.baseUrl}/houses/${houseId}/members`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  createCharge(input: CreateChargeInput) {
    if (this.useMockApi) {
      return of(createMockCharge(input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<MonthlyCharge>>(`${this.baseUrl}/charges`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  listPayments(houseId?: string) {
    if (this.useMockApi) {
      return of(listMockPayments(houseId)).pipe(delay(120));
    }

    const params = houseId ? new HttpParams().set('houseId', houseId) : undefined;
    return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/payments`, this.requestOptions({ params })).pipe(map((response) => response.data));
  }

  upsertPayment(input: UpsertPaymentInput) {
    if (this.useMockApi) {
      return of(upsertMockPayment(input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/payments`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  private requestOptions(options: { params?: HttpParams } = {}) {
    return options;
  }
}
