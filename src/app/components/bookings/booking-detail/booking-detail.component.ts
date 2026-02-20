import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BookingService, Booking } from '../../../services/booking.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="page-title-card flex justify-between items-center">
        <h2 class="page-title">Booking Details</h2>
        <button [routerLink]="['/dashboard/bookings']" class="btn-on-gradient">Back to List</button>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-600">Loading...</p>
      </div>

      <div *ngIf="booking && !loading" class="space-y-6">
        <!-- Booking Information -->
        <div class="card">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Booking Information</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">PNR</label>
              <p class="text-gray-900 font-medium">{{ booking.pnr }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Passenger Name</label>
              <p class="text-gray-900">{{ booking.paxName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
              <p class="text-gray-900">{{ booking.contactNumber }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Contact Person</label>
              <p class="text-gray-900">{{ booking.contactPerson || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span class="badge" [ngClass]="getStatusClass(getDisplayStatus())">
                {{ getDisplayStatus() }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Account Verified</label>
              <span [ngClass]="booking.verifiedByAccount ? 'text-green-600 font-medium' : 'text-gray-500'">{{ booking.verifiedByAccount ? 'Verified' : 'Not Verified' }}</span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Admin Verified</label>
              <span [ngClass]="booking.verifiedByAdmin ? 'text-green-600 font-medium' : 'text-gray-500'">{{ booking.verifiedByAdmin ? 'Verified' : 'Not Verified' }}</span>
            </div>
            <!-- Admin: change status (Ticked / Unticketed / Cancelled) -->
            <div *ngIf="isAdmin()" class="col-span-full mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <label class="block text-sm font-medium text-gray-700 mb-2">Admin: Change status</label>
              <div class="flex flex-wrap items-center gap-2">
                <select [(ngModel)]="adminStatus" [ngModelOptions]="{standalone: true}" class="input max-w-xs">
                  <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
                </select>
                <button type="button" (click)="saveAdminStatus()" class="btn btn-primary" [disabled]="adminStatus === getDisplayStatus()">
                  Save status
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Date of Submission</label>
              <p class="text-gray-900">{{ booking.dateOfSubmission | date:'short' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Submitted By</label>
              <p class="text-gray-900">{{ booking.submittedByName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Supplier</label>
              <p class="text-gray-900">{{ booking.supplierName || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Sector Type</label>
              <p class="text-gray-900">{{ booking.sectorType }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Travel Date</label>
              <p class="text-gray-900">{{ booking.travelDate | date:'shortDate' }}</p>
            </div>
            <div *ngIf="booking.returnDate">
              <label class="block text-sm font-medium text-gray-500 mb-1">Return Date</label>
              <p class="text-gray-900">{{ booking.returnDate | date:'shortDate' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Route</label>
              <p class="text-gray-900">{{ booking.from }} → {{ booking.to }}</p>
            </div>
            <div *ngIf="booking.airline">
              <label class="block text-sm font-medium text-gray-500 mb-1">Airline</label>
              <p class="text-gray-900">{{ booking.airline }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Our Cost</label>
              <p class="text-gray-900">{{ booking.ourCost | number:'1.2-2' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Sale Price</label>
              <p class="text-gray-900">{{ booking.salePrice | number:'1.2-2' }}</p>
            </div>
            <div *ngIf="booking.additionalService">
              <label class="block text-sm font-medium text-gray-500 mb-1">Additional Service</label>
              <p class="text-gray-900">{{ booking.additionalService }} ({{ booking.additionalServicePrice | number:'1.2-2' }})</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Total Sale Price</label>
              <p class="text-gray-900 font-semibold">{{ booking.totalSalePrice | number:'1.2-2' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Total Paid</label>
              <p class="text-gray-900">{{ booking.totalPaidAmount | number:'1.2-2' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Balance Amount</label>
              <p class="text-gray-900 font-semibold" [ngClass]="{'text-red-600': (booking.balanceAmount || 0) > 0}">
                {{ (booking.balanceAmount || 0) | number:'1.2-2' }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Billing Status</label>
              <span class="badge" [ngClass]="getBillingStatusClass(booking.billingStatus || 'Unpaid')">
                {{ booking.billingStatus || 'Unpaid' }}
              </span>
            </div>
            <div *ngIf="booking.note" class="col-span-full">
              <label class="block text-sm font-medium text-gray-500 mb-1">Note</label>
              <p class="text-gray-900">{{ booking.note }}</p>
            </div>
          </div>

          <!-- Multiple Sectors -->
          <div *ngIf="booking.multipleSectors && booking.multipleSectors.length > 0" class="mt-4">
            <h4 class="text-lg font-semibold mb-2">Multiple Sectors</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Travel Date</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let sector of booking.multipleSectors">
                    <td class="px-4 py-2 text-sm">{{ sector.travelDate | date:'shortDate' }}</td>
                    <td class="px-4 py-2 text-sm">{{ sector.from }}</td>
                    <td class="px-4 py-2 text-sm">{{ sector.to }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payments -->
          <div *ngIf="booking.payments && booking.payments.length > 0" class="mt-4">
            <h4 class="text-lg font-semibold mb-2">Payment History</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let payment of booking.payments">
                    <td class="px-4 py-2 text-sm">{{ payment.paymentDate | date:'shortDate' }}</td>
                    <td class="px-4 py-2 text-sm">{{ payment.paidAmount | number:'1.2-2' }}</td>
                    <td class="px-4 py-2 text-sm">{{ payment.paymentMode }}</td>
                    <td class="px-4 py-2 text-sm">{{ payment.referenceNo || 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Cancellation Details -->
        <div *ngIf="booking.cancellation && booking.cancellation.isCancelled" class="card bg-red-50">
          <h3 class="text-xl font-semibold mb-4 text-red-700">Cancellation Details</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Payment Mode Was</label>
              <p class="text-gray-900">{{ booking.cancellation.paymentModeWas }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Total Amount Paid</label>
              <p class="text-gray-900">{{ booking.cancellation.totalAmountPaidByClient | number:'1.2-2' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Refundable Amount</label>
              <p class="text-gray-900">{{ booking.cancellation.refundableAmount | number:'1.2-2' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Old Margin</label>
              <p class="text-gray-900">{{ booking.cancellation.oldMargin | number:'1.2-2' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">New Margin</label>
              <p class="text-gray-900">{{ booking.cancellation.newMargin | number:'1.2-2' }}</p>
            </div>
            <div *ngIf="booking.cancellation.paymentModeWas !== 'Credit Card'">
              <label class="block text-sm font-medium text-gray-500 mb-1">Committed to Client</label>
              <p class="text-gray-900">{{ booking.cancellation.committedToClient | number:'1.2-2' }}</p>
            </div>
            <div *ngIf="booking.cancellation.paymentModeWas === 'Credit Card'">
              <label class="block text-sm font-medium text-gray-500 mb-1">Charge from Client</label>
              <p class="text-gray-900">{{ booking.cancellation.chargeFromClient | number:'1.2-2' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">Refund Processed</label>
              <span class="badge" [ngClass]="booking.cancellation.refundProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                {{ booking.cancellation.refundProcessed ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="col-span-full">
              <label class="block text-sm font-medium text-gray-500 mb-1">Remarks</label>
              <p class="text-gray-900">{{ booking.cancellation.remarks }}</p>
            </div>
            <div *ngIf="isAdmin()" class="col-span-full mt-4 pt-4 border-t border-red-200">
              <button type="button" (click)="revertCancellation()" class="btn btn-primary">
                Revert to active (admin)
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="card" *ngIf="!booking.cancellation || !booking.cancellation.isCancelled">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Actions</h3>
          <div class="flex flex-wrap gap-2">
            <button 
              *ngIf="canVerify()" 
              (click)="verifyBooking()" 
              class="btn btn-primary"
            >
              Verify
            </button>
            <button 
              *ngIf="canEdit()" 
              [routerLink]="['/dashboard/bookings', booking._id, 'edit']" 
              class="btn btn-secondary"
            >
              Edit
            </button>
            <button 
              *ngIf="canDateChange()" 
              (click)="showDateChangeForm = !showDateChangeForm" 
              class="btn btn-secondary"
            >
              Date Change
            </button>
            <button 
              *ngIf="canFlightChange()" 
              (click)="showFlightChangeForm = !showFlightChangeForm" 
              class="btn btn-secondary"
            >
              Flight Change
            </button>
            <button 
              *ngIf="canCancel()" 
              (click)="showCancelForm = !showCancelForm" 
              class="btn btn-danger"
            >
              Cancel Booking
            </button>
            <button 
              *ngIf="canProcessRefund()" 
              (click)="processRefund()" 
              class="btn btn-primary"
            >
              Process Refund
            </button>
          </div>
        </div>

        <!-- Date Change Form -->
        <div *ngIf="showDateChangeForm" class="card bg-blue-50">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Date Change</h3>
          <form [formGroup]="dateChangeForm" (ngSubmit)="onDateChange()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center">
                <input type="checkbox" formControlName="changeTravelDate" id="changeTravelDate" class="mr-2 h-4 w-4 rounded border-gray-300 accent-button focus:ring-2 focus:ring-button focus:ring-offset-0" />
                <label for="changeTravelDate" class="text-sm font-medium text-gray-700">Change Travel Date</label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" formControlName="changeReturnDate" id="changeReturnDate" class="mr-2 h-4 w-4 rounded border-gray-300 accent-button focus:ring-2 focus:ring-button focus:ring-offset-0" />
                <label for="changeReturnDate" class="text-sm font-medium text-gray-700">Change Return Date</label>
              </div>
              <div *ngIf="dateChangeForm.get('changeTravelDate')?.value">
                <label class="block text-sm font-medium text-gray-700 mb-1">New Travel Date</label>
                <input type="date" formControlName="newTravelDate" class="input" />
              </div>
              <div *ngIf="dateChangeForm.get('changeReturnDate')?.value">
                <label class="block text-sm font-medium text-gray-700 mb-1">New Return Date</label>
                <input type="date" formControlName="newReturnDate" class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Our Cost</label>
                <input type="number" formControlName="newOurCost" class="input" step="0.01" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Sale Price</label>
                <input type="number" formControlName="newSalePrice" class="input" step="0.01" />
              </div>
              <div class="col-span-full">
                <label class="block text-sm font-medium text-gray-700 mb-1">Remarks <span class="text-red-500">*</span></label>
                <textarea formControlName="remarks" class="input" rows="3" required></textarea>
              </div>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
              <button type="button" (click)="showDateChangeForm = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="dateChangeForm.invalid">Submit</button>
            </div>
          </form>
        </div>

        <!-- Flight Change Form -->
        <div *ngIf="showFlightChangeForm" class="card bg-blue-50">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Flight Change</h3>
          <form [formGroup]="flightChangeForm" (ngSubmit)="onFlightChange()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Airline</label>
                <input type="text" formControlName="airline" class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New From</label>
                <input type="text" formControlName="from" class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New To</label>
                <input type="text" formControlName="to" class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Travel Date</label>
                <input type="date" formControlName="travelDate" class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Return Date</label>
                <input type="date" formControlName="returnDate" class="input" />
              </div>
              <div class="col-span-full">
                <label class="block text-sm font-medium text-gray-700 mb-1">Remarks <span class="text-red-500">*</span></label>
                <textarea formControlName="remarks" class="input" rows="3" required></textarea>
              </div>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
              <button type="button" (click)="showFlightChangeForm = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="flightChangeForm.invalid">Submit</button>
            </div>
          </form>
        </div>

        <!-- Cancel Form -->
        <div *ngIf="showCancelForm" class="card bg-red-50">
          <h3 class="text-xl font-semibold mb-4 text-red-700">Cancel Booking</h3>
          <form [formGroup]="cancelForm" (ngSubmit)="onCancel()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Payment Mode Was <span class="text-red-500">*</span></label>
                <select formControlName="paymentModeWas" class="input" required>
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Refundable Amount</label>
                <input type="number" formControlName="refundableAmount" class="input" step="0.01" />
              </div>
              <div *ngIf="cancelForm.get('paymentModeWas')?.value !== 'Credit Card'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Committed to Client <span class="text-red-500">*</span></label>
                <input type="number" formControlName="committedToClient" class="input" step="0.01" />
              </div>
              <div *ngIf="cancelForm.get('paymentModeWas')?.value === 'Credit Card'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Charge from Client <span class="text-red-500">*</span></label>
                <input type="number" formControlName="chargeFromClient" class="input" step="0.01" />
              </div>
              <div class="col-span-full">
                <label class="block text-sm font-medium text-gray-700 mb-1">Remarks <span class="text-red-500">*</span></label>
                <textarea formControlName="remarks" class="input" rows="3" required></textarea>
              </div>
            </div>
            <div class="mt-4">
              <div class="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 class="font-semibold mb-2">Margin Calculation</h4>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-gray-600">Old Margin:</span>
                    <span class="font-medium ml-2">{{ oldMargin | number:'1.2-2' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">New Margin:</span>
                    <span class="font-medium ml-2">{{ newMargin | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
              <button type="button" (click)="showCancelForm = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-danger" [disabled]="cancelForm.invalid">Confirm Cancellation</button>
            </div>
          </form>
        </div>

        <!-- Progress History -->
        <div class="card">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Progress History</h3>
          <div class="space-y-4">
            <div *ngFor="let history of booking.progressHistory" class="border-l-4 border-primary-500 pl-4 py-2">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-900">{{ history.action }}</p>
                  <p class="text-sm text-gray-600">{{ history.performedByName }}</p>
                  <p class="text-xs text-gray-500">{{ history.timestamp | date:'short' }}</p>
                  <p *ngIf="history.remarks" class="text-sm text-gray-700 mt-1">{{ history.remarks }}</p>
                </div>
              </div>
            </div>
            <div *ngIf="!booking.progressHistory || booking.progressHistory.length === 0" class="text-gray-500">
              No history available
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingDetailComponent implements OnInit {
  booking: Booking | null = null;
  loading = true;
  showDateChangeForm = false;
  showFlightChangeForm = false;
  showCancelForm = false;
  dateChangeForm: FormGroup;
  flightChangeForm: FormGroup;
  cancelForm: FormGroup;
  adminStatus = '';
  statusOptions = ['Ticked', 'Unticketed', 'Cancelled'];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.dateChangeForm = this.fb.group({
      changeTravelDate: [false],
      changeReturnDate: [false],
      newTravelDate: [''],
      newReturnDate: [''],
      newOurCost: [null],
      newSalePrice: [null],
      remarks: ['', Validators.required]
    });

    this.flightChangeForm = this.fb.group({
      airline: [''],
      from: [''],
      to: [''],
      travelDate: [''],
      returnDate: [''],
      remarks: ['', Validators.required]
    });

    this.cancelForm = this.fb.group({
      paymentModeWas: ['', Validators.required],
      refundableAmount: [0],
      committedToClient: [null],
      chargeFromClient: [null],
      remarks: ['', Validators.required]
    });

    // Watch payment mode changes to update validators
    this.cancelForm.get('paymentModeWas')?.valueChanges.subscribe(mode => {
      if (mode === 'Credit Card') {
        this.cancelForm.get('chargeFromClient')?.setValidators([Validators.required]);
        this.cancelForm.get('committedToClient')?.clearValidators();
      } else {
        this.cancelForm.get('committedToClient')?.setValidators([Validators.required]);
        this.cancelForm.get('chargeFromClient')?.clearValidators();
      }
      this.cancelForm.get('chargeFromClient')?.updateValueAndValidity();
      this.cancelForm.get('committedToClient')?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadBooking(params['id']);
      }
    });
  }

  loadBooking(id: string) {
    this.loading = true;
    this.bookingService.getBooking(id).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.adminStatus = this.getDisplayStatus();
        this.loading = false;
        this.initializeForms();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  isAdmin(): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'ADMIN';
  }

  /** Display status: only Ticked / Unticketed / Cancelled */
  getDisplayStatus(): string {
    if (!this.booking) return 'Ticked';
    if (this.booking.cancellation?.isCancelled) return 'Cancelled';
    // Use actual status from database if it's Ticked or Unticketed
    if (this.booking.status === 'Ticked' || this.booking.status === 'Unticketed') {
      return this.booking.status;
    }
    // Default: show Unticketed for Agent2 supplier, Ticked for others
    if (this.booking.supplierName === 'Agent2') return 'Unticketed';
    return 'Ticked';
  }

  saveAdminStatus() {
    if (!this.booking || this.adminStatus === this.getDisplayStatus()) return;
    const payload: any = { status: this.adminStatus };
    if (this.adminStatus === 'Cancelled') {
      payload.cancellation = { isCancelled: true };
    } else if (this.adminStatus === 'Ticked' || this.adminStatus === 'Unticketed') {
      // Clear cancellation if setting to Ticked/Unticketed
      if (this.booking.cancellation?.isCancelled) {
        payload.cancellation = { isCancelled: false };
      }
    }
    this.bookingService.updateBooking(this.booking._id!, payload).subscribe({
      next: () => {
        this.toastr.success('Status updated', 'Success');
        this.loadBooking(this.booking!._id!);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to update status', 'Error');
      }
    });
  }

  revertCancellation() {
    if (!this.booking) return;
    this.bookingService.updateBooking(this.booking._id!, {
      status: 'Pending Verification',
      cancellation: { isCancelled: false }
    }).subscribe({
      next: () => {
        this.toastr.success('Booking reverted to active', 'Success');
        this.loadBooking(this.booking!._id!);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to revert cancellation', 'Error');
      }
    });
  }

  initializeForms() {
    if (this.booking) {
      this.dateChangeForm.patchValue({
        newOurCost: this.booking.ourCost,
        newSalePrice: this.booking.salePrice
      });
    }
  }

  canVerify(): boolean {
    if (!this.booking) return false;
    const user = this.authService.getCurrentUserValue();
    if (!user) return false;
    
    if (user.role === 'ACCOUNT' && !this.booking.verifiedByAccount) {
      return this.booking.status === 'Pending Verification' || this.booking.status === 'Unticketed';
    }
    if (user.role === 'ADMIN' && !this.booking.verifiedByAdmin) {
      return this.booking.status !== 'Billed' && this.booking.status !== 'Paid';
    }
    return false;
  }

  canEdit(): boolean {
    if (!this.booking) return false;
    const user = this.authService.getCurrentUserValue();
    if (!user) return false;
    
    if (user.role === 'ADMIN') return true;
    if (user.role === 'AGENT1') {
      return !this.booking.verifiedByAccount && !this.booking.verifiedByAdmin;
    }
    return false;
  }

  canDateChange(): boolean {
    return this.booking !== null && (!this.booking.cancellation || !this.booking.cancellation.isCancelled);
  }

  canFlightChange(): boolean {
    return this.booking !== null && (!this.booking.cancellation || !this.booking.cancellation.isCancelled);
  }

  canCancel(): boolean {
    if (!this.booking) return false;
    const user = this.authService.getCurrentUserValue();
    if (user?.role !== 'ACCOUNT' && user?.role !== 'ADMIN') return false;
    return !this.booking.cancellation || !this.booking.cancellation.isCancelled;
  }

  canProcessRefund(): boolean {
    if (!this.booking || !this.booking.cancellation || !this.booking.cancellation.isCancelled) return false;
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'ACCOUNT' || user?.role === 'ADMIN';
  }

  verifyBooking() {
    if (!this.booking) return;
    const user = this.authService.getCurrentUserValue();
    if (!user) return;

    if (user.role === 'ACCOUNT') {
      this.bookingService.verifyByAccount(this.booking._id!).subscribe({
        next: () => {
          this.loadBooking(this.booking!._id!);
        }
      });
    } else if (user.role === 'ADMIN') {
      this.bookingService.verifyByAdmin(this.booking._id!).subscribe({
        next: () => {
          this.loadBooking(this.booking!._id!);
        }
      });
    }
  }

  onDateChange() {
    if (this.dateChangeForm.valid && this.booking) {
      const formValue = this.dateChangeForm.value;
      this.bookingService.dateChange(this.booking._id!, formValue).subscribe({
        next: () => {
          this.showDateChangeForm = false;
          this.loadBooking(this.booking!._id!);
        }
      });
    }
  }

  onFlightChange() {
    if (this.flightChangeForm.valid && this.booking) {
      const formValue = this.flightChangeForm.value;
      const newDetails: any = {};
      if (formValue.airline) newDetails.airline = formValue.airline;
      if (formValue.from) newDetails.from = formValue.from;
      if (formValue.to) newDetails.to = formValue.to;
      if (formValue.travelDate) newDetails.travelDate = formValue.travelDate;
      if (formValue.returnDate) newDetails.returnDate = formValue.returnDate;

      this.bookingService.flightChange(this.booking._id!, {
        newDetails,
        remarks: formValue.remarks
      }).subscribe({
        next: () => {
          this.showFlightChangeForm = false;
          this.loadBooking(this.booking!._id!);
        }
      });
    }
  }

  onCancel() {
    if (this.cancelForm.valid && this.booking) {
      const formValue = this.cancelForm.value;
      this.bookingService.cancelBooking(this.booking._id!, {
        paymentModeWas: formValue.paymentModeWas,
        refundableAmount: formValue.refundableAmount || 0,
        committedToClient: formValue.committedToClient,
        chargeFromClient: formValue.chargeFromClient,
        remarks: formValue.remarks
      }).subscribe({
        next: () => {
          this.showCancelForm = false;
          this.loadBooking(this.booking!._id!);
        }
      });
    }
  }

  processRefund() {
    if (this.booking) {
      this.bookingService.processRefund(this.booking._id!).subscribe({
        next: () => {
          this.loadBooking(this.booking!._id!);
        }
      });
    }
  }

  get oldMargin(): number {
    if (!this.booking) return 0;
    return (this.booking.salePrice || 0) - (this.booking.ourCost || 0);
  }

  get newMargin(): number {
    if (!this.booking || !this.cancelForm) return 0;
    const formValue = this.cancelForm.value;
    const paymentMode = formValue.paymentModeWas;
    
    if (paymentMode === 'Credit Card') {
      const chargeFromClient = formValue.chargeFromClient || 0;
      return (this.booking.salePrice || 0) - chargeFromClient;
    } else {
      const committedToClient = formValue.committedToClient || 0;
      return (this.booking.salePrice || 0) - committedToClient;
    }
  }

  getStatusDisplay(status: string): string {
    if (status === 'Unticketed') return 'Unticketed';
    if (status === 'Ticked') return 'Ticked';
    return status || 'Draft';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Pending Verification': 'bg-yellow-100 text-yellow-800',
      'Account Verified': 'bg-green-100 text-green-800',
      'Admin Verified': 'bg-green-200 text-green-900',
      'Billed': 'bg-purple-100 text-purple-800',
      'Paid': 'bg-green-200 text-green-900',
      'Cancelled': 'bg-red-100 text-red-800',
      'Ticked': 'bg-green-100 text-green-800',
      'Unticketed': 'bg-orange-100 text-orange-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  getBillingStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Unpaid': 'bg-red-100 text-red-800',
      'Partial Paid': 'bg-yellow-100 text-yellow-800',
      'Fully Paid': 'bg-green-100 text-green-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }
}
