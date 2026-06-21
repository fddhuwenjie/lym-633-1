import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useActivityStore } from '../../store/useActivityStore';
import ActivityCard from '../../components/features/ActivityCard';
import { ActivityStatus } from '../../types';

const Dashboard = () => {
  const { activities, getPositionsByActivityId } = useActivityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');

  const statusOptions: { value: ActivityStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部活动' },
    { value: 'recruiting', label: '招募中' },
    { value: 'ongoing', label: '进行中' },
    { value: 'ended', label: '已结束' },
  ];

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      
      return matchesSearch && matchesStatus && activity.status !== 'draft';
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const recruiting = activities.filter(a => a.status === 'recruiting').length;
    const ongoing = activities.filter(a => a.status === 'ongoing').length;
    const ended = activities.filter(a => a.status === 'ended').length;
    return { recruiting, ongoing, ended, total: activities.filter(a => a.status !== 'draft').length };
  }, [activities]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">
          志愿有你，温暖同行 🌟
        </h1>
        <p className="text-primary-100 mb-6">
          发现有意义的志愿活动，记录你的服务时光
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-primary-100">全部活动</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-3xl font-bold text-green-300">{stats.recruiting}</p>
            <p className="text-sm text-primary-100">招募中</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-3xl font-bold text-blue-300">{stats.ongoing}</p>
            <p className="text-sm text-primary-100">进行中</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-3xl font-bold text-slate-300">{stats.ended}</p>
            <p className="text-sm text-primary-100">已结束</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="搜索活动名称、地点..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ActivityCard
                activity={activity}
                positions={getPositionsByActivityId(activity.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">暂无符合条件的活动</h3>
          <p className="text-slate-500">试试其他筛选条件吧</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
