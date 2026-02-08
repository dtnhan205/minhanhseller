import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import type { Hack, HackStatusType } from '@/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ImageInput from '@/components/ui/ImageInput';
import Button from '@/components/ui/Button';
import { Activity, Link as LinkIcon, Plus, Edit, Trash2, Shield, AlertTriangle } from 'lucide-react';

export default function HacksTab() {
  const { success: showSuccess, error: showError } = useToastStore();
  const [hacks, setHacks] = useState<Hack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingHack, setEditingHack] = useState<Hack | null>(null);
  const [form, setForm] = useState<{
    name: string;
    image: string;
    status: HackStatusType;
    downloadUrl: string;
    description: string;
  }>({
    name: '',
    image: '',
    status: 'safe',
    downloadUrl: '',
    description: '',
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getHacks();
        setHacks(data);
      } catch (err: any) {
        showError(err?.response?.data?.message || 'Failed to load hacks');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [showError]);

  const resetForm = () => {
    setEditingHack(null);
    setForm({
      name: '',
      image: '',
      status: 'safe',
      downloadUrl: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError('Vui lòng nhập tên hack');
      return;
    }

    try {
      if (editingHack) {
        const updated = await adminApi.updateHack(editingHack._id, {
          name: form.name,
          image: form.image || undefined,
          status: form.status,
          downloadUrl: form.downloadUrl || undefined,
          description: form.description || undefined,
        });
        setHacks((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
        showSuccess('Cập nhật hack thành công!');
      } else {
        const created = await adminApi.createHack({
          name: form.name,
          image: form.image || undefined,
          status: form.status,
          downloadUrl: form.downloadUrl || undefined,
          description: form.description || undefined,
        });
        setHacks((prev) => [created, ...prev]);
        showSuccess('Tạo hack mới thành công!');
      }
      resetForm();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Lưu hack thất bại');
    }
  };

  const handleEdit = (hack: Hack) => {
    setEditingHack(hack);
    setForm({
      name: hack.name,
      image: hack.image || '',
      status: hack.status,
      downloadUrl: hack.downloadUrl || '',
      description: hack.description || '',
    });
  };

  const handleDelete = async (hack: Hack) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hack này?')) return;
    try {
      await adminApi.deleteHack(hack._id);
      setHacks((prev) => prev.filter((h) => h._id !== hack._id));
      showSuccess('Đã xóa hack');
      if (editingHack?._id === hack._id) {
        resetForm();
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Xóa hack thất bại');
    }
  };

  const renderStatusBadge = (status: HackStatusType) => {
    if (status === 'updating') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">
          <AlertTriangle className="w-3 h-3" />
          Đang update
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
        <Shield className="w-3 h-3" />
        An toàn
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card
        title="Thêm / Sửa Status Hack"
        className="h-fit"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Tên hack
            </label>
            <Input
              placeholder="Ví dụ: Hack Liên Quân VIP"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="bg-black/50 border-gray-800 focus:border-cyan-500"
              required
            />
          </div>

          <ImageInput
            label="Hình ảnh"
            placeholder="https://example.com/image.jpg"
            value={form.image}
            onChange={(value) => setForm((f) => ({ ...f, image: value }))}
            optional={true}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Trạng thái
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as HackStatusType,
                }))
              }
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="safe">An toàn</option>
              <option value="updating">Đang update</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Link tải
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="https://link-tai.com/..."
                value={form.downloadUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, downloadUrl: e.target.value }))
                }
                className="bg-black/50 border-gray-800 focus:border-cyan-500 pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Mô tả
            </label>
            <textarea
              rows={4}
              placeholder="Mô tả ngắn về hack, lưu ý sử dụng, v.v..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          <div className="flex gap-3">
            {editingHack && (
              <Button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700"
              >
                Hủy sửa
              </Button>
            )}
            <Button
              type="submit"
              className={
                editingHack
                  ? 'flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'
                  : 'w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'
              }
            >
              {editingHack ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Cập nhật hack
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm hack
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Danh sách Status Hack"
        className="h-fit"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Đang tải...</div>
        ) : hacks.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            Chưa có hack nào.
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {hacks.map((hack) => (
              <div
                key={hack._id}
                className="p-3 sm:p-4 rounded-xl border border-gray-800 bg-gray-950/50 hover:border-cyan-500/60 hover:bg-gray-900/60 transition-all duration-300 flex gap-3 sm:gap-4"
              >
                {hack.image ? (
                  <img
                    src={hack.image}
                    alt={hack.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-800 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border border-gray-800 flex-shrink-0">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base truncate">
                        {hack.name}
                      </p>
                      <div className="mt-1">{renderStatusBadge(hack.status)}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(hack)}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4 text-cyan-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(hack)}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/40"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  {hack.description && (
                    <p className="text-gray-400 text-xs line-clamp-2 mb-1">
                      {hack.description}
                    </p>
                  )}
                  {hack.downloadUrl && (
                    <div className="flex items-center gap-1 text-xs text-cyan-300 truncate">
                      <LinkIcon className="w-3 h-3" />
                      <span className="truncate">{hack.downloadUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


