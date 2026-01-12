import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Activity {
  id: string;
  sportType: string;
  duration: number;
  date: string;
  time?: string;
  intensity: string;
  location?: string;
  distance?: number;
  notes?: string;
  score: number;
  calories?: number;
  isFavorite: boolean;
  completed: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  activities: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface Stats {
  totalActivities: number;
  totalDuration: number;
  totalScore: number;
  totalCalories: number;
  avgDuration: number;
  avgScore: number;
  favoriteCount: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  sportBreakdown: Array<{
    sportType: string;
    count: number;
    totalDuration: number;
    totalScore: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const headers = this.authService.getAuthHeaders();
    return new HttpHeaders(headers);
  }

  // Activity endpoints
  getActivities(params?: {
    page?: number;
    limit?: number;
    sportType?: string;
    intensity?: string;
    isFavorite?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<ApiResponse<PaginatedResponse<Activity>>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Activity>>>(
      `${this.apiUrl}/activities`,
      { headers: this.getHeaders(), params: httpParams }
    );
  }

  getActivity(id: string): Observable<ApiResponse<Activity>> {
    return this.http.get<ApiResponse<Activity>>(
      `${this.apiUrl}/activities/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createActivity(activity: Partial<Activity>): Observable<ApiResponse<{ activity: Activity }>> {
    return this.http.post<ApiResponse<{ activity: Activity }>>(
      `${this.apiUrl}/activities`,
      activity,
      { headers: this.getHeaders() }
    );
  }

  updateActivity(id: string, activity: Partial<Activity>): Observable<ApiResponse<{ activity: Activity }>> {
    return this.http.put<ApiResponse<{ activity: Activity }>>(
      `${this.apiUrl}/activities/${id}`,
      activity,
      { headers: this.getHeaders() }
    );
  }

  deleteActivity(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.apiUrl}/activities/${id}`,
      { headers: this.getHeaders() }
    );
  }

  toggleFavorite(id: string, isFavorite: boolean): Observable<ApiResponse<{ isFavorite: boolean }>> {
    return this.http.patch<ApiResponse<{ isFavorite: boolean }>>(
      `${this.apiUrl}/activities/${id}/favorite`,
      { isFavorite },
      { headers: this.getHeaders() }
    );
  }

  // Statistics endpoints
  getDashboard(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/stats/dashboard`,
      { headers: this.getHeaders() }
    );
  }

  getWeeklyStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/stats/weekly`,
      { headers: this.getHeaders() }
    );
  }

  getMonthlyStats(year?: number, month?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());

    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/stats/monthly`,
      { headers: this.getHeaders(), params }
    );
  }

  getYearlyStats(year?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());

    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/stats/yearly`,
      { headers: this.getHeaders(), params }
    );
  }

  // Leaderboard endpoints
  getLeaderboard(page?: number, limit?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());

    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/stats/leaderboard`,
      { headers: this.getHeaders(), params }
    );
  }
}
