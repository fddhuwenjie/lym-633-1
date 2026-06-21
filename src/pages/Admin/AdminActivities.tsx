import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Eye, Calendar, Users } from 'lucide-react';
import { useActivityStore } from '../../store/useActivityStore';
import { useRegistrationStore } from '../../store/useRegistrationStore';
import { formatDate } from '../../utils/date';
import { ActivityStatus } from '../../types';

const AdminActivities = () => {
  const navigate = useNavigate();
  const { activities, positions, updateActivityStatus } = useActivityStore();
  const { getRegistrationsByActivityId } = useRegistrationStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredActivities = activities.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = (id: string, newStatus: ActivityStatus) => {
    updateActivityStatus(id, newStatus);
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: '草稿',
      recruiting: '招募中',
      ongoing: '进行中',
      ended: '已结束',
      cancelled: '已取消'
    };
    return map[status] || status;
  };

  const statusOptions: ActivityStatus[] = ['draft', 'recruiting', 'ongoing', 'ended'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">
            活动管理
          </h1>
          <p className="text-slate-500">管理所有志愿活动信息</p>
        </div>
        <Link to="/admin/activities/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          新建活动
        </Link>
      </div>

      <div className="flex gap-2">
        {['all', 'draft', 'recruiting', 'ongoing', 'ended'].map(status => (
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
                <th>活动</th>
                <th>时间</th>
                <th>状态</th>
                <th>岗位数</th>
                <th>报名人数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map(activity => {
                const activityPositions = positions.filter(p => p.activityId === activity.id);
                const activityRegs = getRegistrationsByActivityId(activity.id);
                const confirmedCount = activityRegs.filter(r => r.status === 'confirmed').length;
                const totalQuota = activityPositions.reduce((sum, p) => sum + p.totalQuota, 0);

                return (
                  <tr key={activity.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={activity.coverImage}
                          alt={activity.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{activity.title}</p>
                          <p className="text-xs text-slate-500">{activity.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600 text-sm">
                      {formatDate(activity.startTime)}
                    </td>
                    <td>
                      <select
                        value={activity.status}
                        onChange={e => handleStatusChange(activity.id, e.target.value as ActivityStatus)}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>
                            {statusLabel(opt)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-400" />
                        {activityPositions.length} 个
                      </div>
                    </td>
                    <td className="text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-slate-400" />
                        {confirmedCount}/{totalQuota}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/activity/${activity.id}`)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/activities/${activity.id}/edit`)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminActivities;
