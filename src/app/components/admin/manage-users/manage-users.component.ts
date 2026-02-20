import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, User } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="page-title-card flex justify-between items-center">
        <h2 class="page-title">Manage Users</h2>
        <button 
          (click)="showAddForm = !showAddForm" 
          class="btn-on-gradient flex items-center gap-2"
          [title]="showAddForm ? 'Cancel' : 'Add New User'"
        >
          <svg *ngIf="!showAddForm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <svg *ngIf="showAddForm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ showAddForm ? 'Cancel' : 'Add New User' }}
        </button>
      </div>

      <!-- Add/Edit User Form -->
      <div *ngIf="showAddForm || editingUser" class="card mb-6">
        <h3 class="text-xl font-semibold mb-4 text-gray-700">{{ editingUser ? 'Edit User' : 'Add New User' }}</h3>
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
              <input type="text" formControlName="name" class="input" placeholder="Enter name" [class.border-red-500]="userForm.get('name')?.invalid && userForm.get('name')?.touched" />
              <p *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="text-red-500 text-xs mt-1">Name is required</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
              <input type="email" formControlName="email" class="input" placeholder="Enter email" [class.border-red-500]="userForm.get('email')?.invalid && userForm.get('email')?.touched" />
              <p *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                {{ userForm.get('email')?.errors?.['required'] ? 'Email is required' : 'Enter a valid email' }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
              <select formControlName="role" class="input" [class.border-red-500]="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                <option value="">Select Role</option>
                <option value="AGENT1">Agent 1</option>
                <option value="AGENT2">Agent 2</option>
                <option value="ACCOUNT">Account</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" class="text-red-500 text-xs mt-1">Please select a role</p>
            </div>
            <div *ngIf="!editingUser">
              <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
              <input type="password" formControlName="password" class="input" placeholder="Enter password" [class.border-red-500]="userForm.get('password')?.invalid && userForm.get('password')?.touched" />
              <p *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="text-red-500 text-xs mt-1">Password is required for new users</p>
            </div>
            <div *ngIf="editingUser" class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-700">Status</span>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="userForm.get('isActive')?.value"
                (click)="userForm.patchValue({ isActive: !userForm.get('isActive')?.value })"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:ring-offset-2"
                [class.bg-gray-200]="!userForm.get('isActive')?.value"
                [class.toggle-active]="userForm.get('isActive')?.value"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                  [class.translate-x-5]="userForm.get('isActive')?.value"
                  [class.translate-x-0.5]="!userForm.get('isActive')?.value"
                ></span>
              </button>
              <span class="text-sm text-gray-600">{{ userForm.get('isActive')?.value ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>
          <div class="mt-4 flex justify-end space-x-2">
            <button 
              type="button" 
              (click)="cancelForm()" 
              class="btn btn-secondary flex items-center gap-2"
              title="Cancel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary flex items-center gap-2" 
              [title]="editingUser ? 'Update User' : 'Create User'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ editingUser ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Users Table -->
      <div class="card">
        <h3 class="text-xl font-semibold mb-4 text-gray-700">Users List</h3>
        <div class="overflow-x-auto -mx-3 sm:mx-0">
          <div class="inline-block min-w-full align-middle">
            <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let user of users" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="badge" [ngClass]="getRoleClass(user.role)">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      [attr.aria-checked]="user.isActive !== false"
                      [attr.aria-label]="(user.isActive !== false ? 'Deactivate' : 'Activate') + ' ' + user.name"
                      (click)="toggleActive(user)"
                      [disabled]="togglingUserId === user._id"
                      class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      [class.bg-gray-200]="user.isActive === false"
                      [class.toggle-active]="user.isActive !== false"
                    >
                      <span
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
                        [class.translate-x-5]="user.isActive !== false"
                        [class.translate-x-0.5]="user.isActive === false"
                      ></span>
                    </button>
                    <span class="text-gray-600 text-xs">{{ user.isActive !== false ? 'Active' : 'Inactive' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button 
                      (click)="editUser(user)" 
                      class="text-primary-600 hover:text-primary-900 flex items-center gap-1 px-2 py-1 rounded transition-colors"
                      title="Edit User"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button 
                      *ngIf="user._id !== currentUserId" 
                      (click)="deleteUser(user)" 
                      class="text-red-600 hover:text-red-900 flex items-center gap-1 px-2 py-1 rounded transition-colors"
                      title="Delete User"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">No users found</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  showAddForm = false;
  editingUser: User | null = null;
  userForm: FormGroup;
  currentUserId: string | null = null;
  togglingUserId: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: [''],
      isActive: [true]
    });

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
      }
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      }
    });
  }

  onSubmit() {
    if (!this.editingUser) {
      const pw = this.userForm.get('password');
      if (!pw?.value?.trim()) {
        pw?.setErrors({ required: true });
        pw?.markAsTouched();
      }
    }
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      const errors: string[] = [];
      if (this.userForm.get('name')?.errors?.['required']) errors.push('Name is required');
      if (this.userForm.get('email')?.errors?.['required']) errors.push('Email is required');
      if (this.userForm.get('email')?.errors?.['email']) errors.push('Enter a valid email');
      if (this.userForm.get('role')?.errors?.['required']) errors.push('Please select a role');
      if (!this.editingUser && (this.userForm.get('password')?.errors?.['required'] || !this.userForm.get('password')?.value?.trim())) errors.push('Password is required');
      this.toastr.error(errors.length ? errors.join('. ') : 'Please fix the errors in the form', 'Validation Error');
      return;
    }

    const formValue = this.userForm.value;

    if (this.editingUser) {
      // Update user
      const updateData: any = {
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
        isActive: formValue.isActive
      };

      this.userService.updateUser(this.editingUser._id!, updateData).subscribe({
        next: () => {
          this.toastr.success('User updated successfully', 'Success');
          this.loadUsers();
          this.cancelForm();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to update user', 'Error');
        }
      });
    } else {
      // Create user
      if (!formValue.password) {
        this.toastr.warning('Password is required for new users', 'Warning');
        return;
      }

      this.userService.createUser({
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
        password: formValue.password
      }).subscribe({
        next: () => {
          this.toastr.success('User created successfully', 'Success');
          this.loadUsers();
          this.cancelForm();
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to create user', 'Error');
        }
      });
    }
  }

  editUser(user: User) {
    this.editingUser = user;
    this.showAddForm = true;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive !== false
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  toggleActive(user: User) {
    if (this.togglingUserId) return;
    const newActive = !(user.isActive !== false);
    this.togglingUserId = user._id!;
    this.userService.updateUser(user._id!, { isActive: newActive }).subscribe({
      next: () => {
        user.isActive = newActive;
        this.toastr.success(`User "${user.name}" is now ${newActive ? 'Active' : 'Inactive'}`, 'Success');
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to update status', 'Error');
      }
    }).add(() => {
      this.togglingUserId = null;
    });
  }

  deleteUser(user: User) {
    Swal.fire({
      title: 'Permanently delete user?',
      text: `"${user.name}" will be permanently removed from the system. This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, permanently delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user._id!).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'User has been permanently deleted.', 'success');
            this.toastr.success(`User "${user.name}" permanently deleted`, 'Success');
            this.loadUsers();
          },
          error: (err) => {
            Swal.fire('Error!', err.error?.message || 'Failed to delete user', 'error');
            this.toastr.error(err.error?.message || 'Failed to delete user', 'Error');
          }
        });
      }
    });
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingUser = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  getRoleClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      'AGENT1': 'bg-blue-100 text-blue-800',
      'AGENT2': 'bg-purple-100 text-purple-800',
      'ACCOUNT': 'bg-green-100 text-green-800',
      'ADMIN': 'bg-red-100 text-red-800'
    };
    return roleMap[role] || 'bg-gray-100 text-gray-800';
  }
}
