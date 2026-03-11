import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BookingService, Booking } from '../../../services/booking.service';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="page-title-card">
        <h2 class="page-title">Manage Bookings</h2>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <form [formGroup]="filterForm" class="grid grid-cols-1 gap-4" [class.md:grid-cols-4]="showStatusFilter() && !isAccount()" [class.md:grid-cols-3]="!showStatusFilter() || isAccount()">
          <div *ngIf="isAccount()">
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter</label>
            <select formControlName="verified" class="input">
              <option value="">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          <div *ngIf="showStatusFilter() && !isAccount()">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select formControlName="status" class="input">
              <option value="">All Status</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Ticked">Ticked</option>
              <option value="Unticketed">Unticketed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div *ngIf="!isAccount()">
            <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select formControlName="supplier" class="input" [disabled]="loadingSuppliers">
              <option value="">All Suppliers</option>
              <option *ngFor="let s of suppliers" [value]="s._id">{{ s.name }}</option>
            </select>
            <div *ngIf="loadingSuppliers" class="mt-1">
              <div class="skeleton-line w-full h-10"></div>
            </div>
          </div>
          <div *ngIf="!isAccount()">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input type="date" formControlName="dateFrom" class="input" />
          </div>
          <div *ngIf="!isAccount()">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input type="date" formControlName="dateTo" class="input" />
          </div>
          <div *ngIf="isAccount()">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input type="date" formControlName="dateFrom" class="input" />
          </div>
          <div *ngIf="isAccount()">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input type="date" formControlName="dateTo" class="input" />
          </div>
        </form>
        <div class="mt-4 flex justify-end">
          <button (click)="applyFilters()" class="btn btn-primary mr-2">Apply Filters</button>
          <button (click)="clearFilters()" class="btn btn-secondary">Clear</button>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="card overflow-x-auto -mx-3 sm:mx-0">
        <div class="inline-block min-w-full align-middle">
          <!-- Loading skeleton -->
          <table *ngIf="loading" class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR</th>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Account Verified</th>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Admin Verified</th>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Pending Amount</th>
                <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let i of [1,2,3,4,5]" class="animate-pulse">
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap"><div class="skeleton-line w-20 h-4"></div></td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap"><div class="skeleton-line w-20 h-4"></div></td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap"><div class="skeleton-line w-24 h-4"></div></td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell"><div class="skeleton-line w-20 h-4"></div></td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap"><div class="skeleton-line w-16 h-4"></div></td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell"><div class="skeleton-line w-20 h-4"></div></td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell"><div class="skeleton-line w-20 h-4"></div></td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell"><div class="skeleton-line w-16 h-4"></div></td>
                <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap"><div class="skeleton-line w-12 h-4"></div></td>
              </tr>
            </tbody>
          </table>
          <!-- Actual table -->
          <table *ngIf="!loading" class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR</th>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Account Verified</th>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Admin Verified</th>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Pending Amount</th>
              <th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let booking of bookings" class="hover:bg-gray-50">
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{{ booking.pnr }}</td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{{ booking.dateOfSubmission | date:'shortDate' }}</td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{{ booking.paxName }}</td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{{ booking.contactNumber }}</td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <span class="badge text-xs" [ngClass]="getStatusClass(getDisplayStatus(booking))">
                  {{ getDisplayStatus(booking) }}
                </span>
              </td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">
                <span [ngClass]="booking.verifiedByAccount ? 'text-green-600 font-medium' : 'text-gray-500'">{{ booking.verifiedByAccount ? 'Verified' : 'Not Verified' }}</span>
              </td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">
                <span [ngClass]="booking.verifiedByAdmin ? 'text-green-600 font-medium' : 'text-gray-500'">{{ booking.verifiedByAdmin ? 'Verified' : 'Not Verified' }}</span>
              </td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                {{ booking.balanceAmount | number:'1.2-2' }}
              </td>
              <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                <a [routerLink]="['/dashboard/bookings', booking._id]" class="text-primary-600 hover:text-primary-900">View</a>
              </td>
            </tr>
            <tr *ngIf="bookings.length === 0">
              <td colspan="9" class="px-6 py-4 text-center text-gray-500">No bookings found</td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 flex items-center justify-between border-t border-gray-200" *ngIf="totalPages > 1">
          <div class="text-sm text-gray-700">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          <div class="flex space-x-2">
            <button 
              (click)="changePage(currentPage - 1)" 
              [disabled]="currentPage === 1"
              class="btn btn-secondary"
              [class.opacity-50]="currentPage === 1"
            >
              Previous
            </button>
            <button 
              (click)="changePage(currentPage + 1)" 
              [disabled]="currentPage === totalPages"
              class="btn btn-secondary"
              [class.opacity-50]="currentPage === totalPages"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  suppliers: Supplier[] = [];
  filterForm: FormGroup;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  loading = true;
  loadingSuppliers = true;

  constructor(
    private bookingService: BookingService,
    private supplierService: SupplierService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      verified: [''],
      supplier: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  isAccount(): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'ACCOUNT';
  }

  ngOnInit() {
    this.loadSuppliers();
    const q = this.route.snapshot.queryParams;
    if (q['status']) {
      this.filterForm.patchValue({ status: q['status'] });
    }
    if (q['verified']) {
      this.filterForm.patchValue({ verified: q['verified'] });
    }
    this.loadBookings();
  }

  showStatusFilter(): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role !== 'AGENT1' && user?.role !== 'AGENT2';
  }

  loadSuppliers() {
    this.loadingSuppliers = true;
    this.supplierService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.loadingSuppliers = false;
      },
      error: () => {
        this.loadingSuppliers = false;
      }
    });
  }

  loadBookings() {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      limit: 10
    };

    const filters = this.filterForm.value;
    if (filters.status) params.status = filters.status;
    if (this.isAccount() && filters.verified) params.verified = filters.verified;
    if (filters.supplier) params.supplier = filters.supplier;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;

    this.bookingService.getBookings(params).subscribe({
      next: (response) => {
        this.bookings = response.bookings;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadBookings();
  }

  clearFilters() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadBookings();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBookings();
    }
  }

  /** Display status: only Ticked / Unticketed / Cancelled (no Draft, Pending Verification, etc.) */
  getDisplayStatus(booking: Booking): string {
    if (booking.cancellation?.isCancelled) return 'Cancelled';
    // Use actual status from database if it's Ticked or Unticketed
    if (booking.status === 'Ticked' || booking.status === 'Unticketed') {
      return booking.status;
    }
    // Default: show Unticketed for Agent2 supplier, Ticked for others
    if (booking.supplierName === 'Agent2') return 'Unticketed';
    return 'Ticked';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Cancelled': 'bg-red-100 text-red-800',
      'Ticked': 'bg-green-100 text-green-800',
      'Unticketed': 'bg-orange-100 text-orange-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }
}
