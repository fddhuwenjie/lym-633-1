import { useState, useMemo } from 'react';
import { 
  Clock, Award, Calendar, 
  ChevronRight, Award as AwardIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserStore } from '../../store/useUserStore';
import { useRegistrationStore } from '../../store/useRegistrationStore';
import { useWorkHourStore } from '../../store/useWorkHourStore';
import { useCertificateStore } from '../../store/useCertificateStore';
import { useActivityStore } from '../../store/useActivityStore';
import { formatDate, formatDateTime } from '../../utils/date';
import { Link } from 'react-router-dom';

type TabType = 'registrations' | 'workhours' | 'certificates';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>('registrations');
  
  const { getCurrentUser, users } = useUserStore();
  const { getRegistrationsByUserId } = useRegistrationStore();
  const { getWorkHoursByUserId, getTotalApprovedHours } = useWorkHourStore();
  const { getCertificatesByUserId } = useCertificateStore();
  const { getActivityById, getPositionById } = useActivityStore();

  const currentUser = getCurrentUser();

  const userRegistrations = useMemo(() => currentUser ? getRegistrationsByUserId(currentUser.id) : [], [currentUser, getRegistrationsByUserId]);
  const userWorkHours = useMemo(() => currentUser ? getWorkHoursByUserId(currentUser.id) : [], [currentUser, getWorkHoursByUserId]);
  const userCertificates = useMemo(() => currentUser ? getCertificatesByUserId(currentUser.id) : [], [currentUser, getCertificatesByUserId]);
  const totalApprovedHours = currentUser ? getTotalApprovedHours(currentUser.id) : 0;

  const monthlyStats = useMemo(() => {
    const months: Record<string, number> = {};
    
    userWorkHours
      .filter(w => w.status === 'approved')
      .forEach(wh => {
        const date = new Date(wh.submittedAt || wh.reviewedAt || '');
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months[monthKey] = (months[monthKey] || 0) + wh.hours;
      });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, hours]) => ({
        month: month.substring(5) + '月',
        时长: Math.round(hours * 100) / 100
      }));
  }, [userWorkHours]);

  const stats = {
    totalActivities: userRegistrations.filter(r => r.status === 'confirmed').length,
    totalHours: totalApprovedHours,
    totalCertificates: userCertificates.filter(c => c.status === 'valid').length,
    totalRegistrations: userRegistrations.length
  };

  const tabs = [
    { key: 'registrations' as TabType, label: '报名记录', icon: Calendar },
    { key: 'workhours' as TabType, label: '工时记录', icon: Clock },
    { key: 'certificates' as TabType, label: '我的证书', icon: Award },
  ];

  if (!currentUser) {
    return <div className="text-center py-16">请先登录</div>;
  }

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
      case 'valid':
        return 'badge-success';
      case 'pending':
      case 'waitlist':
        return 'badge-warning';
      case 'rejected':
      case 'revoked':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '待确认',
      confirmed: '已录取',
      waitlist: '候补中',
      cancelled: '已取消',
      rejected: '已拒绝',
      approved: '已通过',
      draft: '草稿',
      valid: '有效',
      revoked: '已撤销'
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-2xl border-4 border-white/30 shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h1 className="font-serif text-2xl font-bold text-white mb-1">
                {currentUser.name}
              </h1>
              <p className="text-primary-100 mb-2">
                {currentUser.role === 'organizer' ? '活动组织者' : 
                 currentUser.role === 'manager' ? '岗位负责人' : '志愿者'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {currentUser.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-white/20 text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {stats.totalActivities}
            </div>
            <p className="text-sm text-slate-500">参与活动</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {totalApprovedHours.toFixed(1)}
            </div>
            <p className="text-sm text-slate-500">服务时长(小时)</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-3xl font-bold text-amber-600 mb-1">
              {stats.totalCertificates}
            </div>
            <p className="text-sm text-slate-500">获得证书</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.totalRegistrations}
            </div>
            <p className="text-sm text-slate-500">报名次数</p>
          </div>
        </div>
      </div>

      {monthlyStats.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-serif font-semibold text-slate-800 mb-4">
            月度服务时长统计
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="时长" 
                  fill="#0d9488" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div className="border-b border-slate-200">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'registrations' && (
            <div className="space-y-3">
              {userRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500">暂无报名记录</p>
                  <Link to="/" className="btn-primary inline-block mt-4">
                    去报名活动
                  </Link>
                </div>
              ) : (
                userRegistrations
                  .sort((a, b) => new Date(b.signUpTime).getTime() - new Date(a.signUpTime).getTime())
                  .map(reg => {
                    const activity = getActivityById(reg.activityId);
                    const position = getPositionById(reg.positionId);
                    return (
                      <Link
                        key={reg.id}
                        to={`/activity/${reg.activityId}`}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {activity?.coverImage && (
                            <img
                              src={activity.coverImage}
                              alt={activity.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-slate-800">
                              {activity?.title}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {position?.name} · {formatDate(reg.signUpTime)} 报名
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge ${statusBadgeClass(reg.status)}`}>
                            {statusLabel(reg.status)}
                            {reg.status === 'waitlist' && reg.waitlistOrder && ` 第${reg.waitlistOrder}位`}
                          </span>
                          <ChevronRight size={18} className="text-slate-400" />
                        </div>
                      </Link>
                    );
                  })
              )}
            </div>
          )}

          {activeTab === 'workhours' && (
            <div className="space-y-3">
              {userWorkHours.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500">暂无工时记录</p>
                </div>
              ) : (
                userWorkHours
                  .sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime())
                  .map(wh => {
                    const activity = getActivityById(wh.activityId);
                    return (
                      <div
                        key={wh.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Clock className="text-primary-600" size={24} />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-800">
                              {activity?.title}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {wh.submittedAt ? `提交时间：${formatDateTime(wh.submittedAt)}` : '草稿'}
                              {wh.reviewedAt && ` · 审核时间：${formatDateTime(wh.reviewedAt)}`}
                            </p>
                            {wh.rejectReason && (
                              <p className="text-xs text-red-600 mt-1">
                                退回原因：{wh.rejectReason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-800">
                            {wh.hours.toFixed(1)}
                            <span className="text-sm font-normal text-slate-500 ml-1">小时</span>
                          </p>
                          <span className={`badge ${statusBadgeClass(wh.status)} mt-1`}>
                            {statusLabel(wh.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-4">
              {userCertificates.length === 0 ? (
                <div className="text-center py-12">
                  <AwardIcon className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500">暂无证书</p>
                  <p className="text-sm text-slate-400 mt-1">
                    完成志愿服务并通过审核后将获得证书
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {userCertificates
                    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                    .map(cert => {
                      const activity = getActivityById(cert.activityId);
                      const issuer = users.find(u => u.id === cert.issuerId);
                      return (
                        <div
                          key={cert.id}
                          className={`relative p-5 rounded-xl border-2 ${
                            cert.status === 'valid'
                              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                              : 'bg-slate-100 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <AwardIcon 
                                size={28} 
                                className={cert.status === 'valid' ? 'text-amber-500' : 'text-slate-400'} 
                              />
                              <div>
                                <h3 className="font-serif font-bold text-slate-800">
                                  志愿服务证书
                                </h3>
                                <p className="text-xs text-slate-500">{cert.certificateNo}</p>
                              </div>
                            </div>
                            <span className={`badge ${cert.status === 'valid' ? 'badge-success' : 'badge-error'}`}>
                              {cert.status === 'valid' ? '有效' : '已撤销'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <p className="text-slate-600">
                              持证人：<span className="font-medium text-slate-800">{currentUser.name}</span>
                            </p>
                            <p className="text-slate-600">
                              活动名称：<span className="font-medium text-slate-800">{activity?.title}</span>
                            </p>
                            <p className="text-slate-600">
                              服务时长：<span className="font-medium text-slate-800">{cert.hours} 小时</span>
                            </p>
                            <p className="text-slate-600">
                              签发日期：<span className="font-medium text-slate-800">{formatDate(cert.issueDate)}</span>
                            </p>
                            <p className="text-slate-600">
                              签发人：<span className="font-medium text-slate-800">{issuer?.name}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
