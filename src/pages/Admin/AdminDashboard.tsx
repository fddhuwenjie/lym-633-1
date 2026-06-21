import { useMemo } from 'react';
import { 
  Calendar, Users, Clock, Award, 
  TrendingUp, UserCheck, FileText
} from 'lucide-react';
import { useActivityStore } from '../../store/useActivityStore';
import { useRegistrationStore } from '../../store/useRegistrationStore';
import { useWorkHourStore } from '../../store/useWorkHourStore';
import { useCertificateStore } from '../../store/useCertificateStore';
import { useUserStore } from '../../store/useUserStore';
import { formatDate } from '../../utils/date';

const AdminDashboard = () => {
  const { activities, positions } = useActivityStore();
  const { registrations } = useRegistrationStore();
  const { workHours, getPendingWorkHours } = useWorkHourStore();
  const { certificates } = useCertificateStore();
  const { users } = useUserStore();

  const stats = useMemo(() => {
    const totalActivities = activities.filter(a => a.status !== 'draft').length;
    const recruiting = activities.filter(a => a.status === 'recruiting').length;
    const totalPositions = positions.length;
    const totalRegistrations = registrations.length;
    const confirmedRegs = registrations.filter(r => r.status === 'confirmed').length;
    const waitlistRegs = registrations.filter(r => r.status === 'waitlist').length;
    const pendingWorkHours = getPendingWorkHours().length;
    const totalApprovedHours = workHours
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.hours, 0);
    const totalCertificates = certificates.filter(c => c.status === 'valid').length;
    const totalVolunteers = users.filter(u => u.role === 'volunteer').length;

    return {
      totalActivities,
      recruiting,
      totalPositions,
      totalRegistrations,
      confirmedRegs,
      waitlistRegs,
      pendingWorkHours,
      totalApprovedHours,
      totalCertificates,
      totalVolunteers
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, positions, registrations, workHours, certificates, users]);

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pendingReviews = getPendingWorkHours().slice(0, 5);

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'recruiting': return 'bg-green-100 text-green-700';
      case 'ongoing': return 'bg-blue-100 text-blue-700';
      case 'ended': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-800">
          管理后台
        </h1>
        <p className="text-slate-500">欢迎回来，查看平台运营数据</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-primary-600" size={20} />
            </div>
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalActivities}</p>
          <p className="text-sm text-slate-500">活动总数</p>
          <p className="text-xs text-primary-600 mt-1">{stats.recruiting} 个招募中</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <UserCheck className="text-green-500" size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalVolunteers}</p>
          <p className="text-sm text-slate-500">志愿者数</p>
          <p className="text-xs text-blue-600 mt-1">{stats.confirmedRegs} 次已确认报名</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-600" size={20} />
            </div>
            <Clock className="text-amber-500" size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalApprovedHours.toFixed(1)}</p>
          <p className="text-sm text-slate-500">已认证工时</p>
          <p className="text-xs text-amber-600 mt-1">{stats.pendingWorkHours} 条待审核</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="text-green-600" size={20} />
            </div>
            <Award className="text-green-500" size={16} />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalCertificates}</p>
          <p className="text-sm text-slate-500">签发证书</p>
          <p className="text-xs text-green-600 mt-1">累计服务认证</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-primary-600" />
              最近活动
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center gap-3">
                <img
                  src={activity.coverImage}
                  alt={activity.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(activity.startTime)}</p>
                </div>
                <span className={`badge ${statusBadgeClass(activity.status)}`}>
                  {statusLabel(activity.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-amber-600" />
              待审核工时
              <span className="badge badge-warning">{stats.pendingWorkHours}</span>
            </h3>
          </div>
          <div className="p-5">
            {pendingReviews.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <UserCheck className="mx-auto mb-2 text-slate-300" size={32} />
                <p>暂无待审核的工时</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviews.map(wh => {
                  const user = users.find(u => u.id === wh.userId);
                  const activity = activities.find(a => a.id === wh.activityId);
                  return (
                    <div key={wh.id} className="flex items-center gap-3">
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{activity?.title}</p>
                      </div>
                      <span className="font-semibold text-primary-600">
                        {wh.hours}h
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">快速统计</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-xl font-bold text-slate-800">{stats.totalRegistrations}</p>
            <p className="text-sm text-slate-500">总报名数</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-xl font-bold text-green-700">{stats.confirmedRegs}</p>
            <p className="text-sm text-green-600">已确认</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <p className="text-xl font-bold text-amber-700">{stats.waitlistRegs}</p>
            <p className="text-sm text-amber-600">候补人数</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-xl font-bold text-slate-800">{stats.totalPositions}</p>
            <p className="text-sm text-slate-500">岗位总数</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
