import { useState, useMemo } from 'react';
import { Users, Check, X, Clock, UserCheck } from 'lucide-react';
import { useRegistrationStore } from '../../store/useRegistrationStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useUserStore } from '../../store/useUserStore';
import { formatDateTime } from '../../utils/date';

const AdminRegistrations = () => {
  const { registrations, confirmRegistration, cancelRegistration } = useRegistrationStore();
  const { getActivityById, getPositionById, activities } = useActivityStore();
  const { getUserById } = useUserStore();
  
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      if (activityFilter !== 'all' && reg.activityId !== activityFilter) return false;
      if (statusFilter !== 'all' && reg.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => new Date(b.signUpTime).getTime() - new Date(a.signUpTime).getTime());
  }, [registrations, activityFilter, statusFilter]);

  const handleConfirm = (regId: string) => {
    confirmRegistration(regId);
  };

  const handleReject = (regId: string) => {
    cancelRegistration(regId);
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'waitlist': return 'badge-warning';
      case 'cancelled': return 'badge-error';
      case 'rejected': return 'badge-error';
      default: return 'badge-info';
    }
  };

  const statusLabel = (status: string, waitlistOrder?: number | null) => {
    const map: Record<string, string> = {
      pending: '待确认',
      confirmed: '已录取',
      waitlist: '候补',
      cancelled: '已取消',
      rejected: '已拒绝'
    };
    let label = map[status] || status;
    if (status === 'waitlist' && waitlistOrder) {
      label += ` 第${waitlistOrder}位`;
    }
    return label;
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    waitlist: registrations.filter(r => r.status === 'waitlist').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-800">
          报名管理
        </h1>
        <p className="text-slate-500">管理活动报名和候补队列</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">总报名数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-slate-500">待确认</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-sm text-slate-500">已录取</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.waitlist}</p>
          <p className="text-sm text-slate-500">候补中</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-sm text-slate-600 mr-2">活动：</label>
          <select
            value={activityFilter}
            onChange={e => setActivityFilter(e.target.value)}
            className="input-field inline-block w-auto py-2 text-sm"
          >
            <option value="all">全部活动</option>
            {activities.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600 mr-2">状态：</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field inline-block w-auto py-2 text-sm"
          >
            <option value="all">全部状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已录取</option>
            <option value="waitlist">候补中</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>志愿者</th>
                <th>活动</th>
                <th>岗位</th>
                <th>报名时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map(reg => {
                const user = getUserById(reg.userId);
                const activity = getActivityById(reg.activityId);
                const position = getPositionById(reg.positionId);
                
                return (
                  <tr key={reg.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="w-9 h-9 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{user?.name}</p>
                          <p className="text-xs text-slate-500">{user?.skills.slice(0, 2).join('、')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-700 text-sm max-w-[200px] truncate">
                      {activity?.title}
                    </td>
                    <td>
                      <span className="badge badge-primary">{position?.name}</span>
                    </td>
                    <td className="text-sm text-slate-500">
                      {formatDateTime(reg.signUpTime)}
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass(reg.status)}`}>
                        {statusLabel(reg.status, reg.waitlistOrder)}
                      </span>
                    </td>
                    <td>
                      {reg.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConfirm(reg.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="确认录取"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(reg.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="拒绝"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      {reg.status === 'confirmed' && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <UserCheck size={14} />
                          已录取
                        </span>
                      )}
                      {reg.status === 'waitlist' && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <Clock size={14} />
                          候补中
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">暂无符合条件的报名记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrations;
