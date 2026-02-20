import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BookingService, Booking, Payment } from '../../../services/booking.service';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="page-title-card">
        <h2 class="page-title">{{ isAccountPaymentOnlyMode() ? 'Manage Payments' : (isAgent2CommercialOnly() ? 'Edit Commercial Details' : (isEditMode ? 'Edit Booking' : 'New Booking')) }}</h2>
      </div>

      <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Auto/System Fields: hidden for Account payment-only mode -->
        <div class="card" *ngIf="!isAccountPaymentOnlyMode()">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">System Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date of Submission</label>
              <input type="text" [value]="bookingForm.get('dateOfSubmission')?.value | date" class="input bg-gray-100" readonly />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
              <input type="text" [value]="currentUserName" class="input bg-gray-100" readonly />
            </div>
          </div>
        </div>

        <!-- Passenger & Contact Details: hidden for Account payment-only mode -->
        <div class="card" *ngIf="!isAccountPaymentOnlyMode()">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Passenger & Contact Details</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">PAX Name <span class="text-red-500">*</span></label>
              <input type="text" formControlName="paxName" class="input" placeholder="Enter passenger name" [class.border-red-500]="bookingForm.get('paxName')?.invalid && bookingForm.get('paxName')?.touched" />
              <p *ngIf="bookingForm.get('paxName')?.invalid && bookingForm.get('paxName')?.touched" class="text-red-500 text-xs mt-1">PAX name is required</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input type="text" formControlName="contactPerson" class="input" placeholder="Enter contact person" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number <span class="text-red-500">*</span></label>
              <div class="flex gap-2">
                <select formControlName="countryCode" class="input w-32 flex-shrink-0" [class.border-red-500]="bookingForm.get('contactNumber')?.invalid && bookingForm.get('contactNumber')?.touched">
                  <option *ngFor="let c of countryOptions" [value]="c.code">{{ c.code }} {{ c.name }}</option>
                </select>
                <input
                  type="tel"
                  formControlName="contactNumber"
                  class="input flex-1"
                  placeholder="e.g. 9876543210"
                  maxlength="15"
                  (input)="onContactNumberInput($event)"
                  [class.border-red-500]="bookingForm.get('contactNumber')?.invalid && bookingForm.get('contactNumber')?.touched"
                />
              </div>
              <p *ngIf="bookingForm.get('contactNumber')?.invalid && bookingForm.get('contactNumber')?.touched" class="text-red-500 text-xs mt-1">
                {{ getContactNumberError() }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">PNR <span class="text-red-500">*</span></label>
              <input type="text" formControlName="pnr" class="input uppercase" placeholder="Enter PNR" [class.border-red-500]="bookingForm.get('pnr')?.invalid && bookingForm.get('pnr')?.touched" />
              <p *ngIf="bookingForm.get('pnr')?.invalid && bookingForm.get('pnr')?.touched" class="text-red-500 text-xs mt-1">PNR is required</p>
            </div>
          </div>
        </div>

        <!-- Travel Details: hidden for Account payment-only mode -->
        <div class="card" *ngIf="!isAccountPaymentOnlyMode()">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Travel Details</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sector Type <span class="text-red-500">*</span></label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input type="radio" formControlName="sectorType" value="One Way" class="mr-2" />
                  One Way
                </label>
                <label class="flex items-center">
                  <input type="radio" formControlName="sectorType" value="Round Trip" class="mr-2" />
                  Round Trip
                </label>
                <label class="flex items-center">
                  <input type="radio" formControlName="sectorType" value="Multiple" class="mr-2" />
                  Multiple
                </label>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4" *ngIf="bookingForm.get('sectorType')?.value === 'One Way'">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Travel Date <span class="text-red-500">*</span></label>
                <input type="date" formControlName="travelDate" class="input" [class.border-red-500]="bookingForm.get('travelDate')?.invalid && bookingForm.get('travelDate')?.touched" />
                <p *ngIf="bookingForm.get('travelDate')?.invalid && bookingForm.get('travelDate')?.touched" class="text-red-500 text-xs mt-1">Travel date is required</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">From <span class="text-red-500">*</span></label>
                <input type="text" formControlName="from" class="input" placeholder="Enter origin" [class.border-red-500]="bookingForm.get('from')?.invalid && bookingForm.get('from')?.touched" />
                <p *ngIf="bookingForm.get('from')?.invalid && bookingForm.get('from')?.touched" class="text-red-500 text-xs mt-1">Origin is required</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">To <span class="text-red-500">*</span></label>
                <input type="text" formControlName="to" class="input" placeholder="Enter destination" [class.border-red-500]="bookingForm.get('to')?.invalid && bookingForm.get('to')?.touched" />
                <p *ngIf="bookingForm.get('to')?.invalid && bookingForm.get('to')?.touched" class="text-red-500 text-xs mt-1">Destination is required</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4" *ngIf="bookingForm.get('sectorType')?.value === 'Round Trip'">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Travel Date <span class="text-red-500">*</span></label>
                <input type="date" formControlName="travelDate" class="input" [class.border-red-500]="bookingForm.get('travelDate')?.invalid && bookingForm.get('travelDate')?.touched" />
                <p *ngIf="bookingForm.get('travelDate')?.invalid && bookingForm.get('travelDate')?.touched" class="text-red-500 text-xs mt-1">Travel date is required</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Return Date <span class="text-red-500">*</span></label>
                <input type="date" formControlName="returnDate" class="input" [class.border-red-500]="bookingForm.get('returnDate')?.invalid && bookingForm.get('returnDate')?.touched" />
                <p *ngIf="bookingForm.get('returnDate')?.invalid && bookingForm.get('returnDate')?.touched" class="text-red-500 text-xs mt-1">Return date is required</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">From <span class="text-red-500">*</span></label>
                <input type="text" formControlName="from" class="input" placeholder="Enter origin" [class.border-red-500]="bookingForm.get('from')?.invalid && bookingForm.get('from')?.touched" />
                <p *ngIf="bookingForm.get('from')?.invalid && bookingForm.get('from')?.touched" class="text-red-500 text-xs mt-1">Origin is required</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">To <span class="text-red-500">*</span></label>
                <input type="text" formControlName="to" class="input" placeholder="Enter destination" [class.border-red-500]="bookingForm.get('to')?.invalid && bookingForm.get('to')?.touched" />
                <p *ngIf="bookingForm.get('to')?.invalid && bookingForm.get('to')?.touched" class="text-red-500 text-xs mt-1">Destination is required</p>
              </div>
            </div>

            <div *ngIf="bookingForm.get('sectorType')?.value === 'Multiple'">
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Travel Date <span class="text-red-500">*</span></label>
                  <input type="date" formControlName="travelDate" class="input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">From <span class="text-red-500">*</span></label>
                  <input type="text" formControlName="from" class="input" placeholder="Enter origin" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">To <span class="text-red-500">*</span></label>
                  <input type="text" formControlName="to" class="input" placeholder="Enter destination" />
                </div>
              </div>
              <button type="button" (click)="addMultipleSector()" class="btn btn-secondary mb-4">Add More Sector</button>
              <div formArrayName="multipleSectors" class="space-y-4">
                <div *ngFor="let sector of multipleSectorsArray.controls; let i = index" [formGroupName]="i" class="card bg-gray-50">
                  <div class="grid grid-cols-4 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                      <input type="date" formControlName="travelDate" class="input" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <input type="text" formControlName="from" class="input" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input type="text" formControlName="to" class="input" />
                    </div>
                    <div class="flex items-end">
                      <button type="button" (click)="removeMultipleSector(i)" class="btn btn-danger">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea formControlName="note" class="input" rows="3" placeholder="Any date / remarks"></textarea>
            </div>
          </div>
        </div>

        <!-- Commercial Details: hidden for Account payment-only mode -->
        <div class="card" *ngIf="!isAccountPaymentOnlyMode()">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Commercial Details</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Airline</label>
              <input type="text" formControlName="airline" class="input" placeholder="Enter airline" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select formControlName="supplier" class="input">
                <option value="">Select Supplier</option>
                <option *ngFor="let s of suppliers" [value]="s._id">{{ s.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Our Cost</label>
              <input type="number" formControlName="ourCost" class="input" placeholder="0" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
              <input type="number" formControlName="salePrice" class="input" placeholder="0" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Additional Service</label>
              <input type="text" formControlName="additionalService" class="input" placeholder="Enter additional service" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Additional Service Price <span class="text-gray-400">(optional)</span></label>
              <input type="number" formControlName="additionalServicePrice" class="input" placeholder="Leave blank if none" min="0" step="0.01" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Total Sale Price</label>
              <input type="text" [value]="totalSalePrice | number:'1.2-2'" class="input bg-gray-100" readonly />
            </div>
          </div>
        </div>

        <!-- Payment Details: only Account & Admin can see/edit; Agent1 & Agent2 cannot -->
        <div class="card" *ngIf="canShowPaymentSection()">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">{{ isAccountPaymentOnlyMode() ? 'Manage Payments' : 'Payment Details' }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input type="radio" formControlName="paymentType" value="Full" class="mr-2" />
                  Full
                </label>
                <label class="flex items-center">
                  <input type="radio" formControlName="paymentType" value="Installments" class="mr-2" />
                  Installments
                </label>
              </div>
            </div>

            <div>
              <p class="text-sm text-gray-600 mb-2" *ngIf="bookingForm.get('paymentType')?.value === 'Full'">Enter full payment details below.</p>
              <button type="button" (click)="addPayment()" class="btn btn-secondary mb-4" *ngIf="bookingForm.get('paymentType')?.value === 'Installments'">Add Payment</button>
              <div formArrayName="payments" class="space-y-4">
                <div *ngFor="let payment of paymentsArray.controls; let i = index" [formGroupName]="i" class="card bg-gray-50">
                  <div class="grid grid-cols-4 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Paid Amount <span class="text-red-500">*</span></label>
                      <input type="number" formControlName="paidAmount" class="input" step="0.01" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Payment Mode <span class="text-red-500">*</span></label>
                      <select formControlName="paymentMode" class="input">
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date <span class="text-red-500">*</span></label>
                      <input type="date" formControlName="paymentDate" class="input" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Reference No</label>
                      <input type="text" formControlName="referenceNo" class="input" />
                    </div>
                  </div>
                  <button type="button" (click)="removePayment(i)" class="btn btn-danger mt-2" *ngIf="bookingForm.get('paymentType')?.value === 'Installments' && paymentsArray.controls.length > 1">Remove</button>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Total Paid Amount</label>
                  <input type="text" [value]="totalPaidAmount | number:'1.2-2'" class="input bg-gray-100" readonly />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Balance Amount</label>
                  <input type="text" [value]="balanceAmount | number:'1.2-2'" class="input bg-gray-100" readonly />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="cancel()" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">
            {{ isAccountPaymentOnlyMode() ? 'Update Payments' : (isEditMode ? 'Update Booking' : 'Create Booking') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class NewBookingComponent implements OnInit {
  bookingForm: FormGroup;
  suppliers: Supplier[] = [];
  isEditMode = false;
  bookingId: string | null = null;
  currentUserName = '';

  countryOptions: { code: string; name: string }[] = [
    { code: '+91', name: 'India' },
    { code: '+1', name: 'US/Canada' },
    { code: '+44', name: 'UK' },
    { code: '+971', name: 'UAE' },
    { code: '+966', name: 'Saudi Arabia' },
    { code: '+968', name: 'Oman' },
    { code: '+973', name: 'Bahrain' },
    { code: '+974', name: 'Qatar' },
    { code: '+965', name: 'Kuwait' },
    { code: '+61', name: 'Australia' },
    { code: '+64', name: 'New Zealand' },
    { code: '+81', name: 'Japan' },
    { code: '+86', name: 'China' },
    { code: '+82', name: 'South Korea' },
    { code: '+65', name: 'Singapore' },
    { code: '+60', name: 'Malaysia' },
    { code: '+66', name: 'Thailand' },
    { code: '+84', name: 'Vietnam' },
    { code: '+62', name: 'Indonesia' },
    { code: '+63', name: 'Philippines' },
    { code: '+92', name: 'Pakistan' },
    { code: '+880', name: 'Bangladesh' },
    { code: '+94', name: 'Sri Lanka' },
    { code: '+977', name: 'Nepal' },
    { code: '+960', name: 'Maldives' },
    { code: '+20', name: 'Egypt' },
    { code: '+27', name: 'South Africa' },
    { code: '+234', name: 'Nigeria' },
    { code: '+254', name: 'Kenya' },
    { code: '+233', name: 'Ghana' },
    { code: '+55', name: 'Brazil' },
    { code: '+52', name: 'Mexico' },
    { code: '+7', name: 'Russia/Kazakhstan' },
    { code: '+49', name: 'Germany' },
    { code: '+33', name: 'France' },
    { code: '+39', name: 'Italy' },
    { code: '+34', name: 'Spain' },
    { code: '+31', name: 'Netherlands' },
    { code: '+353', name: 'Ireland' },
    { code: '+46', name: 'Sweden' },
    { code: '+47', name: 'Norway' },
    { code: '+45', name: 'Denmark' },
    { code: '+358', name: 'Finland' },
    { code: '+48', name: 'Poland' },
    { code: '+43', name: 'Austria' },
    { code: '+41', name: 'Switzerland' },
    { code: '+32', name: 'Belgium' },
    { code: '+351', name: 'Portugal' },
    { code: '+30', name: 'Greece' },
    { code: '+90', name: 'Turkey' },
    { code: '+972', name: 'Israel' },
    { code: '+962', name: 'Jordan' },
    { code: '+961', name: 'Lebanon' },
    { code: '+98', name: 'Iran' },
    { code: '+964', name: 'Iraq' },
    { code: '+967', name: 'Yemen' },
    { code: '+212', name: 'Morocco' },
    { code: '+213', name: 'Algeria' },
    { code: '+251', name: 'Ethiopia' },
    { code: '+255', name: 'Tanzania' },
    { code: '+256', name: 'Uganda' },
    { code: '+260', name: 'Zambia' },
    { code: '+852', name: 'Hong Kong' },
    { code: '+853', name: 'Macau' },
    { code: '+886', name: 'Taiwan' },
    { code: '+855', name: 'Cambodia' },
    { code: '+856', name: 'Laos' },
    { code: '+95', name: 'Myanmar' },
    { code: '+673', name: 'Brunei' },
    { code: '+420', name: 'Czech Republic' },
    { code: '+36', name: 'Hungary' },
    { code: '+40', name: 'Romania' },
    { code: '+381', name: 'Serbia' },
    { code: '+380', name: 'Ukraine' },
  ];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private supplierService: SupplierService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.bookingForm = this.createForm();
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserName = user.name;
      }
    });
  }

  ngOnInit() {
    this.loadSuppliers();
    this.ensurePaymentRowWhenFull();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.bookingId = params['id'];
        this.loadBooking(params['id']);
      } else {
        this.ensurePaymentRowWhenFull();
      }
    });

    this.bookingForm.get('paymentType')?.valueChanges.subscribe(() => {
      this.ensurePaymentRowWhenFull();
    });

    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  /** When Full payment is selected, ensure at least one payment row exists */
  ensurePaymentRowWhenFull() {
    if (this.bookingForm.get('paymentType')?.value === 'Full' && this.paymentsArray.length === 0) {
      this.addPayment();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      dateOfSubmission: [new Date()],
      paxName: ['', Validators.required],
      contactPerson: [''],
      countryCode: ['+91'],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
      pnr: ['', Validators.required],
      sectorType: ['One Way', Validators.required],
      travelDate: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      returnDate: [''],
      multipleSectors: this.fb.array([]),
      note: [''],
      airline: [''],
      supplier: [''],
      ourCost: [0],
      salePrice: [0],
      additionalService: [''],
      additionalServicePrice: [null as number | null],
      paymentType: ['Full'],
      payments: this.fb.array([])
    });
  }

  get multipleSectorsArray() {
    return this.bookingForm.get('multipleSectors') as FormArray;
  }

  get paymentsArray() {
    return this.bookingForm.get('payments') as FormArray;
  }

  addMultipleSector() {
    const sectorGroup = this.fb.group({
      travelDate: [''],
      from: [''],
      to: ['']
    });
    this.multipleSectorsArray.push(sectorGroup);
  }

  removeMultipleSector(index: number) {
    this.multipleSectorsArray.removeAt(index);
  }

  addPayment() {
    const paymentGroup = this.fb.group({
      paidAmount: [0, Validators.required],
      paymentMode: ['Cash', Validators.required],
      paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
      referenceNo: ['']
    });
    this.paymentsArray.push(paymentGroup);
  }

  removePayment(index: number) {
    this.paymentsArray.removeAt(index);
  }

  loadSuppliers() {
    this.supplierService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
      }
    });
  }

  loadBooking(id: string) {
    this.bookingService.getBooking(id).subscribe({
      next: (booking) => {
        const { countryCode, localNumber } = this.parseContactNumber(booking.contactNumber || '');
        this.bookingForm.patchValue({
          ...booking,
          countryCode,
          contactNumber: (localNumber || '').replace(/\D/g, ''),
          travelDate: booking.travelDate ? new Date(booking.travelDate).toISOString().split('T')[0] : '',
          returnDate: booking.returnDate ? new Date(booking.returnDate).toISOString().split('T')[0] : '',
          supplier: booking.supplier?._id || booking.supplier || ''
        });

        if (booking.multipleSectors && booking.multipleSectors.length > 0) {
          booking.multipleSectors.forEach(sector => {
            const sectorGroup = this.fb.group({
              travelDate: sector.travelDate ? new Date(sector.travelDate).toISOString().split('T')[0] : '',
              from: sector.from || '',
              to: sector.to || ''
            });
            this.multipleSectorsArray.push(sectorGroup);
          });
        }

        if (booking.payments && booking.payments.length > 0) {
          booking.payments.forEach(payment => {
            const paymentGroup = this.fb.group({
              paidAmount: payment.paidAmount,
              paymentMode: payment.paymentMode,
              paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
              referenceNo: payment.referenceNo || ''
            });
            this.paymentsArray.push(paymentGroup);
          });
        }

        if (this.isAgent2CommercialOnly()) {
          this.disableNonCommercialForAgent2();
        }
        if (this.isAccountPaymentOnlyMode()) {
          this.disableNonPaymentForAccount();
        }
      }
    });
  }

  private disableNonPaymentForAccount(): void {
    const paymentKeys = ['paymentType', 'payments'];
    Object.keys(this.bookingForm.controls).forEach(key => {
      if (!paymentKeys.includes(key)) {
        this.bookingForm.get(key)?.disable();
      }
    });
    this.multipleSectorsArray.controls.forEach(c => c.disable());
  }

  /** Agent2 in edit mode: can only change Supplier, Our Cost, Sale Price, Additional Service/Price */
  isAgent2CommercialOnly(): boolean {
    const user = this.authService.getCurrentUserValue();
    return !!(user?.role === 'AGENT2' && this.isEditMode);
  }

  /** Payment section visible only to Admin (always) and Account (in edit mode). Agent1 & Agent2 never see it. */
  canShowPaymentSection(): boolean {
    const user = this.authService.getCurrentUserValue();
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'ACCOUNT' && this.isEditMode) return true;
    return false;
  }

  /** Account in edit mode: only manage payments (rest of form disabled) */
  isAccountPaymentOnlyMode(): boolean {
    const user = this.authService.getCurrentUserValue();
    return !!(user?.role === 'ACCOUNT' && this.isEditMode);
  }

  private disableNonCommercialForAgent2(): void {
    const commercial = ['supplier', 'ourCost', 'salePrice', 'additionalService', 'additionalServicePrice'];
    Object.keys(this.bookingForm.controls).forEach(key => {
      if (!commercial.includes(key)) {
        this.bookingForm.get(key)?.disable();
      }
    });
    this.multipleSectorsArray.controls.forEach(c => c.disable());
    this.paymentsArray.controls.forEach(c => c.disable());
  }

  calculateTotals() {
    // This will be handled by the backend, but we can show preview
  }

  get totalSalePrice(): number {
    const salePrice = this.bookingForm.get('salePrice')?.value || 0;
    const additionalPrice = this.bookingForm.get('additionalServicePrice')?.value || 0;
    return salePrice + additionalPrice;
  }

  get totalPaidAmount(): number {
    return this.paymentsArray.controls.reduce((sum, control) => {
      return sum + (control.get('paidAmount')?.value || 0);
    }, 0);
  }

  get balanceAmount(): number {
    return this.totalSalePrice - this.totalPaidAmount;
  }

  onSubmit() {
    if (this.isEditMode && this.bookingId && this.isAccountPaymentOnlyMode()) {
      const formValue = this.bookingForm.value;
      const payload = {
        payments: (formValue.payments || []).map((p: any) => ({
          ...p,
          paymentDate: new Date(p.paymentDate)
        }))
      };
      this.bookingService.updateBooking(this.bookingId, payload).subscribe({
        next: () => {
          this.toastr.success('Payments updated successfully', 'Success');
          this.router.navigate(['/dashboard/bookings']);
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to update payments', 'Error');
        }
      });
      return;
    }

    if (this.isEditMode && this.bookingId && this.isAgent2CommercialOnly()) {
      const payload = {
        supplier: this.bookingForm.get('supplier')?.value || undefined,
        ourCost: this.bookingForm.get('ourCost')?.value,
        salePrice: this.bookingForm.get('salePrice')?.value,
        additionalService: this.bookingForm.get('additionalService')?.value ?? undefined,
        additionalServicePrice: this.bookingForm.get('additionalServicePrice')?.value ?? undefined
      };
      this.bookingService.updateBooking(this.bookingId, payload).subscribe({
        next: () => {
          this.toastr.success('Commercial details updated successfully', 'Success');
          this.router.navigate(['/dashboard/bookings']);
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to update booking', 'Error');
        }
      });
      return;
    }

    if (this.bookingForm.get('sectorType')?.value === 'Round Trip' && !this.bookingForm.get('returnDate')?.value) {
      this.bookingForm.get('returnDate')?.setErrors({ required: true });
      this.bookingForm.get('returnDate')?.markAsTouched();
    }
    this.bookingForm.markAllAsTouched();
    if (this.bookingForm.invalid) {
      const messages: string[] = [];
      const map: Record<string, string> = {
        paxName: 'PAX name is required',
        contactNumber: this.getContactNumberError(),
        pnr: 'PNR is required',
        travelDate: 'Travel date is required',
        from: 'From (origin) is required',
        to: 'To (destination) is required',
        returnDate: 'Return date is required for Round Trip'
      };
      ['paxName', 'contactNumber', 'pnr', 'travelDate', 'from', 'to', 'returnDate'].forEach(key => {
        const c = this.bookingForm.get(key);
        if (c?.invalid && c?.errors && map[key]) messages.push(map[key]);
      });
      this.toastr.error(messages.length ? messages.join('. ') : 'Please fill all required fields.', 'Validation Error');
      return;
    }
    const formValue = this.bookingForm.value;
    const fullContactNumber = (formValue.countryCode || '').replace(/\s/g, '') + ' ' + (formValue.contactNumber || '').trim();
      
      // Transform form data (exclude countryCode from payload; use combined contactNumber)
      const { countryCode, ...rest } = formValue;
      const bookingData: any = {
        ...rest,
        contactNumber: fullContactNumber.trim(),
        travelDate: new Date(formValue.travelDate),
        returnDate: formValue.returnDate ? new Date(formValue.returnDate) : null,
        multipleSectors: formValue.multipleSectors.map((s: any) => ({
          ...s,
          travelDate: s.travelDate ? new Date(s.travelDate) : null
        })),
        payments: formValue.payments.map((p: any) => ({
          ...p,
          paymentDate: new Date(p.paymentDate)
        }))
      };

      if (this.isEditMode && this.bookingId) {
        this.bookingService.updateBooking(this.bookingId, bookingData).subscribe({
          next: () => {
            this.toastr.success('Booking updated successfully', 'Success');
            this.router.navigate(['/dashboard/bookings']);
          },
          error: (err) => {
            this.toastr.error(err.error?.message || 'Failed to update booking', 'Error');
          }
        });
      } else {
        this.bookingService.createBooking(bookingData).subscribe({
          next: () => {
            this.toastr.success('Booking created successfully', 'Success');
            this.router.navigate(['/dashboard/bookings']);
          },
          error: (err) => {
            this.toastr.error(err.error?.message || 'Failed to create booking', 'Error');
          }
        });
      }
  }

  cancel() {
    this.router.navigate(['/dashboard/bookings']);
  }

  /** Allow only digits in contact number input */
  onContactNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digitsOnly = (input.value || '').replace(/\D/g, '');
    if (input.value !== digitsOnly) {
      input.value = digitsOnly;
      this.bookingForm.get('contactNumber')?.setValue(digitsOnly, { emitEvent: false });
    }
  }

  getContactNumberError(): string {
    const c = this.bookingForm.get('contactNumber');
    if (!c?.errors) return 'Contact number is required';
    if (c.errors['required']) return 'Contact number is required';
    if (c.errors['pattern']) return 'Contact number must be 6–15 digits only';
    return 'Invalid contact number';
  }

  /** Parse stored contact number into country code and local number for edit form */
  parseContactNumber(full: string): { countryCode: string; localNumber: string } {
    const trimmed = (full || '').trim();
    if (!trimmed) return { countryCode: '+91', localNumber: '' };
    const plusMatch = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
    if (plusMatch) {
      return { countryCode: plusMatch[1], localNumber: (plusMatch[2] || '').trim() };
    }
    return { countryCode: '+91', localNumber: trimmed };
  }
}
