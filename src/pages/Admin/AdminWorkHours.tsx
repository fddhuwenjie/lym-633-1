import { useState, useMemo } from 'react';
import { Clock, Check, X, AlertCircle, UserCheck } from 'lucide-react';
import { useWorkHourStore } from '../../store/useWorkHourStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useUserStore } from '../../store/useUserStore';
import { useCertificateStore } from '../../store/useCertificateStore';
import { formatDateTime } from '../../utils/date';
import { validateSelfReview } from '../../utils/validator';

const AdminWorkHours = () => {
  const { workHours, approveWorkHour, rejectWorkHour, getWorkHourById } = useWorkHourStore();
  const { getActivityById } = useActivityStore();
  const { getCurrentUser, getUserById } = useUserStore();
  const { generateCertificate } = useCertificateStore();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const currentUser = getCurrentUser();

  const filteredWorkHours = useMemo(() => {
    return workHours.filter(wh => {
      if (statusFilter !== 'all' && wh.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime();
    });
  }, [workHours, statusFilter]);

  const handleApprove = (whId: string) => {
    const workHour = getWorkHourById(whId);
    if (!workHour || !currentUser) return;

    if (!validateSelfReview(currentUser.id, workHour)) {
      alert('不能审核自己的工时记录！');
      return;
    }

    approveWorkHour(whId, currentUser.id);
    
    generateCertificate(
      workHour.id,
      workHour.userId,
      workHour.activityId,
      workHour.hours,
      currentUser.id
    );
  };

  const handleReject = (whId: string) => {
    const workHour = getWorkHourById(whId);
    if (!workHour || !currentUser) return;

    if (!validateSelfReview(currentUser.id, workHour)) {
      alert('不能审核自己的工时记录！');
      return;
    }

    if (!rejectReason.trim()) {
      alert('请填写退回原因');
      return;
    }

    rejectWorkHour(whId, currentUser.id, rejectReason);
    setShowRejectModal(null);
    setRejectReason('');
  };

  const openRejectModal = (whId: string) => {
    setShowRejectModal(whId);
    setRejectReason('');
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-error';
      default: return 'badge-info';
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: '草稿',
      pending: '待审核',
      approved: '已通过',
      rejected: '已退回'
    };
    return map[status] || status;
  };

  const stats = {
    total: workHours.length,
    pending: workHours.filter(w => w.status === 'pending').length,
    approved: workHours.filter(w => w.status === 'approved').length,
    rejected: workHours.filter(w => w.status === 'rejected').length,
    totalHours: workHours.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.hours, 0)
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-800">
          工时审核
        </h1>
        <p className="text-slate-500">审核志愿者工时记录并生成证书</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
          <p className="text-sm text-slate-500">待审核</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-slate-500">已通过</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
          <p className="text-sm text-slate-500">已退回</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{stats.totalHours.toFixed(1)}h</p>
          <p className="text-sm text-slate-500">已认证总时长</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {status === 'all' ? '全部' : statusLabel(status)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>志愿者</th>
                <th>活动</th>
                <th>申报时长</th>
                <th>提交时间</th>
                <th>状态</th>
                <th>审核人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkHours.map(wh => {
                const user = getUserById(wh.userId);
                const activity = getActivityById(wh.activityId);
                const reviewer = wh.reviewerId ? getUserById(wh.reviewerId) : null;
                const isSelf = currentUser?.id === wh.userId;
                
                return (
                  <tr key={wh.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="w-9 h-9 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{user?.name}</p>
                          {isSelf && <span className="text-xs text-amber-600">（本人）</span>}
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-700 text-sm max-w-[200px] truncate">
                      {activity?.title}
                    </td>
                    <td>
                      <span className="font-semibold text-primary-600">{wh.hours}</span>
                      <span className="text-sm text-slate-500 ml-1">小时</span>
                    </td>
                    <td className="text-sm text-slate-500">
                      {wh.submittedAt ? formatDateTime(wh.submittedAt) : '-'}
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass(wh.status)}`}>
                        {statusLabel(wh.status)}
                      </span>
                    </td>
                    <td className="text-sm text-slate-500">
                      {reviewer?.name || '-'}
                    </td>
                    <td>
                      {wh.status === 'pending' && !isSelf && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(wh.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="通过"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => openRejectModal(wh.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="退回"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      {wh.status === 'pending' && isSelf && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle size={14} />
                          不能自审
                        </span>
                      )}
                      {wh.status === 'rejected' && wh.rejectReason && (
                        <span className="text-xs text-red-500" title={wh.rejectReason}>
                          原因：{wh.rejectReason.slice(0, 10)}...
                        </span>
                      )}
                      {wh.status === 'approved' && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <UserCheck size={14} />
                          已生成证书
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredWorkHours.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">暂无工时记录</p>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRejectModal(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              退回工时
            </h3>
            
            <p className="text-sm text-slate-600 mb-4">
              请填写退回原因，志愿者可以根据原因修改后重新提交
            </p>
            
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="请输入退回原因..."
              className="input-field w-full mb-4"
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="btn-danger"
              >
                确认退回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkHours;
