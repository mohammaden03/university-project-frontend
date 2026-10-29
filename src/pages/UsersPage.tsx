/**
 * Manuscript AI - User Administration Page
 * 
 * Complies with Section 23 Master Prompt:
 * - List users, view details
 * - Create users with role assignment (ADMIN, RESEARCHER, VIEWER)
 * - Toggle active/deactive status
 * - Role hierarchy enforcement
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Shield,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Lock,
} from 'lucide-react';
import { usersApi } from '../api/auth.api';
import { User, UserRole } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner, ErrorAlert } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Create user modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('RESEARCHER');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Edit user modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('RESEARCHER');
  const [editActive, setEditActive] = useState<boolean>(true);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersApi.listUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در بارگذاری فهرست کاربران');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await usersApi.createUser({
        email: newEmail,
        password: newPassword,
        displayName: newDisplayName,
        role: newRole,
      });

      if (res.success) {
        setIsCreateOpen(false);
        setNewEmail('');
        setNewPassword('');
        setNewDisplayName('');
        toast.success('کاربر جدید با موفقیت ایجاد شد');
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ایجاد کاربر');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await usersApi.updateUser(editingUser.id, {
        role: editRole,
        isActive: editActive,
      });
      setEditingUser(null);
      toast.success('اطلاعات کاربر با موفقیت به‌روزرسانی شد');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || 'خطا در ویرایش کاربر');
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await usersApi.deleteUser(deletingUser.id);
      setDeletingUser(null);
      toast.success('کاربر با موفقیت حذف گردید');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || 'خطا در حذف کاربر');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            مدیریت پژوهشگران و کاربران سامانه
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            کنترل سطح دسترسی‌ها، نقش‌های کاربری (مدیر، مصحح/پژوهشگر، بیننده) و فعال‌سازی حساب‌ها
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          ایجاد حساب پژوهشگر جدید
        </Button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchUsers} />}

      {isLoading ? (
        <LoadingSpinner label="در حال دریافت فهرست کاربران..." />
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500">
                <tr>
                  <th className="p-4">نام و نام خانوادگی</th>
                  <th className="p-4">پست الکترونیکی</th>
                  <th className="p-4">نقش دسترسی</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">تاریخ ثبت‌نام</th>
                  <th className="p-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850 transition-colors">
                    <td className="p-4 font-semibold text-stone-900 dark:text-stone-100">
                      {u.displayName}
                    </td>
                    <td className="p-4 font-mono text-stone-600 dark:text-stone-400">
                      {u.email}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={u.role === 'ADMIN' ? 'purple' : u.role === 'RESEARCHER' ? 'amber' : 'default'}
                        size="sm"
                      >
                        {u.role === 'ADMIN' ? 'مدیر سیستم' : u.role === 'RESEARCHER' ? 'پژوهشگر' : 'بیننده'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-xs">
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-300">فعال</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-rose-600">غیرفعال</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-stone-400">
                      {new Date(u.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setEditRole(u.role);
                            setEditActive(u.isActive);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1 text-stone-400 hover:text-rose-600"
                            aria-label={`حذف کاربر ${u.displayName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="ایجاد حساب پژوهشگر جدید"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">نام و نام خانوادگی:</label>
            <input
              type="text"
              required
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="مثال: دکتر مهدی محقق"
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">ایمیل دانشگاهی:</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="researcher@university.ac.ir"
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">رمز عبور امن:</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="حداقل ۸ کاراکتر"
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">نقش دسترسی:</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950"
            >
              <option value="RESEARCHER">پژوهشگر (دسترسی بازشناسی و تصحیح)</option>
              <option value="VIEWER">بیننده (فقط مشاهده)</option>
              <option value="ADMIN">مدیر ارشد (دسترسی کامل)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              ایجاد حساب کاربری
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`ویرایش کاربر «${editingUser.displayName}»`}
          maxWidth="sm"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingUser(null)}>
                انصراف
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateUser}>
                ذخیره تغییرات
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">نقش سازمانی:</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950"
              >
                <option value="ADMIN">مدیر ارشد سیستم (ADMIN)</option>
                <option value="RESEARCHER">پژوهشگر و مصحح (RESEARCHER)</option>
                <option value="VIEWER">بیننده و ناظر (VIEWER)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="activeToggle"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="rounded accent-amber-600"
              />
              <label htmlFor="activeToggle" className="cursor-pointer font-medium">
                حساب کاربری فعال باشد
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingUser(null)}
          title="تایید حذف حساب کاربری"
          maxWidth="sm"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDeletingUser(null)}>
                انصراف
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDeleteUser}>
                حذف کاربر
              </Button>
            </div>
          }
        >
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            آیا از حذف حساب کاربری «{deletingUser.displayName}» ({deletingUser.email}) اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
          </p>
        </Modal>
      )}
    </div>
  );
};
