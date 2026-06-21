import { Link } from 'react-router-dom';
import { MapPin, Clock, Users } from 'lucide-react';
import { Activity, Position } from '../../types';
import { formatDate } from '../../utils/date';
import { useRegistrationStore } from '../../store/useRegistrationStore';

interface ActivityCardProps {
  activity: Activity;
  positions: Position[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-slate-100 text-slate-600' },
  recruiting: { label: '招募中', className: 'bg-green-100 text-green-700' },
  ongoing: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
  ended: { label: '已结束', className: 'bg-slate-100 text-slate-500' },
  cancelled: { label: '已取消', className: 'bg-red-100 text-red-600' },
};

const ActivityCard = ({ activity, positions }: ActivityCardProps) => {
  const { getConfirmedCountByPosition, getWaitlistCountByPosition } = useRegistrationStore();

  const totalQuota = positions.reduce((sum, p) => sum + p.totalQuota, 0);
  const totalConfirmed = positions.reduce((sum, p) => sum + getConfirmedCountByPosition(p.id), 0);
  const totalWaitlist = positions.reduce((sum, p) => sum + getWaitlistCountByPosition(p.id), 0);
  const progress = totalQuota > 0 ? (totalConfirmed / totalQuota) * 100 : 0;

  const statusInfo = statusConfig[activity.status] || statusConfig.draft;

  return (
    <Link
      to={`/activity/${activity.id}`}
      className="card card-hover group"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <span className={`absolute top-3 left-3 badge ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-serif text-lg font-semibold line-clamp-2">
            {activity.title}
          </h3>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate">{activity.location}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <span>{formatDate(activity.startTime)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users size={14} className="text-slate-400" />
              <span>
                已报 <span className="font-semibold text-slate-800">{totalConfirmed}</span>
                / {totalQuota} 人
              </span>
            </div>
            {totalWaitlist > 0 && (
              <span className="text-xs text-amber-600">
                候补 {totalWaitlist} 人
              </span>
            )}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {positions.slice(0, 3).map(pos => (
            <span
              key={pos.id}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-xs"
            >
              {pos.name}
            </span>
          ))}
          {positions.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
              +{positions.length - 3} 个岗位
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ActivityCard;
