import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, delay, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  addMockMember,
  createMockApplication,
  createMockCharge,
  createMockHouse,
  getMockHouseById,
  listMockHouses,
  listMockPayments,
  upsertMockPayment
} from '../data/mock-data';
import type {
  AddMemberInput,
  Application,
  CreateApplicationInput,
  CreateChargeInput,
  CreateHouseInput,
  HouseDetail,
  HouseFilters,
  HouseSummary,
  MonthlyCharge,
  Payment,
  UpsertPaymentInput
} from '../models/domain.models';

interface ApiResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly useMockApi = environment.useMockApi;

  listHouses(filters: HouseFilters = {}) {
    if (this.useMockApi) {
      return of(listMockHouses(filters)).pipe(delay(120));
    }

    let params = new HttpParams();
    if (filters.city) {
      params = params.set('city', filters.city);
    }
    if (filters.neighborhood) {
      params = params.set('neighborhood', filters.neighborhood);
    }
    if (filters.maxPrice) {
      params = params.set('maxPrice', String(filters.maxPrice));
    }

    return this.http.get<ApiResponse<HouseSummary[]>>(`${this.baseUrl}/houses`, { params }).pipe(
      map((response) => response.data),
      catchError(() => of(listMockHouses(filters)))
    );
  }

  getHouseById(houseId: string) {
    if (this.useMockApi) {
      return of(getMockHouseById(houseId));
    }

    return this.http.get<ApiResponse<HouseDetail>>(`${this.baseUrl}/houses/${houseId}`).pipe(
      map((response) => response.data),
      catchError(() => of(getMockHouseById(houseId)))
    );
  }

  createHouse(input: CreateHouseInput) {
    if (this.useMockApi) {
      return of(createMockHouse(input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<HouseDetail>>(`${this.baseUrl}/houses`, input).pipe(
      map((response) => response.data),
      catchError(() => of(createMockHouse(input)))
    );
  }

  createApplication(input: CreateApplicationInput) {
    if (this.useMockApi) {
      return of(createMockApplication(input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<Application>>(`${this.baseUrl}/applications`, input).pipe(
      map((response) => response.data),
      catchError(() => of(createMockApplication(input)))
    );
  }

  addMember(houseId: string, input: AddMemberInput) {
    if (this.useMockApi) {
      return of(addMockMember(houseId, input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/houses/${houseId}/members`, input).pipe(
      map((response) => response.data),
      catchError(() => of(addMockMember(houseId, input)))
    );
  }

  createCharge(input: CreateChargeInput) {
    if (this.useMockApi) {
      return of(createMockCharge(input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<MonthlyCharge>>(`${this.baseUrl}/charges`, input).pipe(
      map((response) => response.data),
      catchError(() => of(createMockCharge(input)))
    );
  }

  listPayments(houseId?: string) {
    if (this.useMockApi) {
      return of(listMockPayments(houseId)).pipe(delay(120));
    }

    const params = houseId ? new HttpParams().set('houseId', houseId) : undefined;
    return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/payments`, { params }).pipe(
      map((response) => response.data),
      catchError(() => of(listMockPayments(houseId)))
    );
  }

  upsertPayment(input: UpsertPaymentInput) {
    if (this.useMockApi) {
      return of(upsertMockPayment(input)).pipe(delay(120));
    }

    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/payments`, input).pipe(
      map((response) => response.data),
      catchError(() => of(upsertMockPayment(input)))
    );
  }
}
