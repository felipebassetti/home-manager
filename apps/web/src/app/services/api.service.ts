import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { appRuntimeConfig } from '../config/runtime-config';
import { buildDemoHouseInputs } from '../data/demo-house-templates';
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

  listHouses(filters: HouseFilters = {}) {
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
    return this.http.get<ApiResponse<HouseDetail>>(`${this.baseUrl}/houses/${houseId}`, this.requestOptions()).pipe(map((response) => response.data));
  }

  createHouse(input: CreateHouseInput) {
    return this.http.post<ApiResponse<HouseDetail>>(`${this.baseUrl}/houses`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  seedDemoHouses(ownerId: string) {
    const inputs = buildDemoHouseInputs(ownerId);
    return forkJoin(inputs.map((input) => this.createHouse(input)));
  }

  createApplication(input: CreateApplicationInput) {
    return this.http.post<ApiResponse<Application>>(`${this.baseUrl}/applications`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  listApplicationsByUser(userId: string) {
    void userId;
    return this.http.get<ApiResponse<ApplicationListItem[]>>(`${this.baseUrl}/applications`, this.requestOptions()).pipe(map((response) => response.data));
  }

  updateApplicationStatus(input: UpdateApplicationStatusInput) {
    return this.http.patch<ApiResponse<Application>>(`${this.baseUrl}/applications/${input.applicationId}`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  addMember(houseId: string, input: AddMemberInput) {
    return this.http.post<ApiResponse<HouseMember>>(`${this.baseUrl}/houses/${houseId}/members`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  createCharge(input: CreateChargeInput) {
    return this.http.post<ApiResponse<MonthlyCharge>>(`${this.baseUrl}/charges`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  listPayments(houseId?: string) {
    const params = houseId ? new HttpParams().set('houseId', houseId) : undefined;
    return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/payments`, this.requestOptions({ params })).pipe(map((response) => response.data));
  }

  upsertPayment(input: UpsertPaymentInput) {
    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/payments`, input, this.requestOptions()).pipe(map((response) => response.data));
  }

  private requestOptions(options: { params?: HttpParams } = {}) {
    return options;
  }
}
