import { useState, useMemo } from 'react';
import { ClipboardCheck, Check, X, Users } from 'lucide-react';
import { useActivityStore } from '../../store/useActivityStore';
import { useRegistrationStore } from '../../store/useRegistrationStore';
import { useServiceQualityStore } from '../../store/useServiceQualityStore';
import { useUserStore } from '../../store/useUserStore';
import { ServiceQualityType, ServiceEvaluationRating } from '../../types';
import { formatTime, formatDateTime } from '../../utils/date';

interface EditState {
  qualityType: ServiceQualityType;
  lateMinutes: number | null;
  earlyLeaveMinutes: number | null;
  rating: ServiceEvaluationRating | null;
  comment: string;
}

const ServiceReview = () => {
  const { activities, positions, getPositionsByActivityId, getTimeSlotsByPositionId, getTimeSlotsByIds, getActivityById, getPositionById } = useActivityStore();
  const { registrations } = useRegistrationStore();
  const { getRecordsByRegistrationId, addRecord, updateRecord } = useServiceQualityStore();
  const { getCurrentUser, getUserById } = useUserStore();

  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  const currentUser = getCurrentUser();

  const confirmedRegistrations = useMemo(() => {
    let regs = registrations.filter(r => r.status === 'confirmed');
    if (activityFilter !== 'all') {
      regs = regs.filter(r => r.activityId === activityFilter);
    }
    if (positionFilter !== 'all') {
      regs = regs.filter(r => r.positionId === positionFilter);
    }
    return regs;
  }, [registrations, activityFilter, positionFilter]);

  const filteredPositions = useMemo(() => {
    if (activityFilter === 'all') return positions;
    return getPositionsByActivityId(activityFilter);
  }, [activityFilter, positions, getPositionsByActivityId]);

  const stats = useMemo(() => {
    let normalCount = 0;
    let lateCount = 0;
    let earlyLeaveCount = 0;
    let absentCount = 0;

    confirmedRegistrations.forEach(reg => {
      const regRecords = getRecordsByRegistrationId(reg.id);
      if (regRecords.length > 0) {
        const latest = regRecords[regRecords.length - 1];
        switch (latest.qualityType) {
          case 'normal': normalCount++; break;
          case 'late': lateCount++; break;
          case 'early_leave': earlyLeaveCount++; break;
          case 'absent': absentCount++; break;
        }
      }
    });

    return {
      total: confirmedRegistrations.length,
      normal: normalCount,
      late: lateCount,
      earlyLeave: earlyLeaveCount,
      absent: absentCount
    };
  }, [confirmedRegistrations, getRecordsByRegistrationId]);

  const getTimeSlotDisplay = (registration: typeof registrations[0]) => {
    if (registration.selectedTimeSlotIds && registration.selectedTimeSlotIds.length > 0) {
      const slots = getTimeSlotsByIds(registration.selectedTimeSlotIds);
      if (slots.length > 0) {
        return slots.map(s => `${formatTime(s.startTime)}-${formatTime(s.endTime)}`).join('、');
      }
    }
    const slots = getTimeSlotsByPositionId(registration.positionId);
    if (slots.length > 0) {
      return slots.map(s => `${formatTime(s.startTime)}-${formatTime(s.endTime)}`).join('、');
    }
    return '-';
  };

  const getExistingRecord = (registrationId: string) => {
    const regRecords = getRecordsByRegistrationId(registrationId);
    return regRecords.length > 0 ? regRecords[regRecords.length - 1] : null;
  };

  const startEdit = (registrationId: string) => {
    const existing = getExistingRecord(registrationId);
    setEditingId(registrationId);
    setEditState({
      qualityType: existing?.qualityType || 'normal',
      lateMinutes: existing?.lateMinutes ?? null,
      earlyLeaveMinutes: existing?.earlyLeaveMinutes ?? null,
      rating: existing?.rating || null,
      comment: existing?.comment || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const handleSave = (registrationId: string) => {
    if (!editState || !currentUser) return;

    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) return;

    const existing = getExistingRecord(registrationId);

    const data = {
      registrationId: registration.id,
      userId: registration.userId,
      activityId: registration.activityId,
      positionId: registration.positionId,
      timeSlotId: registration.selectedTimeSlotIds?.[0] || null,
      qualityType: editState.qualityType,
      lateMinutes: editState.qualityType === 'late' ? editState.lateMinutes : null,
      earlyLeaveMinutes: editState.qualityType === 'early_leave' ? editState.earlyLeaveMinutes : null,
      rating: editState.rating,
      comment: editState.comment,
      recordedBy: currentUser.id
    };

    if (existing) {
      updateRecord(existing.id, data);
    } else {
      addRecord(data);
    }

    setEditingId(null);
    setEditState(null);
  };

  const qualityTypeLabel = (type: ServiceQualityType) => {
    const map: Record<ServiceQualityType, string> = {
      normal: '正常',
      late: '迟到',
      early_leave: '早退',
      absent: '缺勤'
    };
    return map[type];
  };

  const qualityTypeBadgeClass = (type: ServiceQualityType) => {
    switch (type) {
      case 'normal': return 'badge-success';
      case 'late': return 'badge-warning';
      case 'early_leave': return 'badge-warning';
      case 'absent': return 'badge-error';
      default: return 'badge-info';
    }
  };

  const ratingLabel = (rating: ServiceEvaluationRating | null) => {
    if (!rating) return '-';
    const map: Record<ServiceEvaluationRating, string> = {
      excellent: '优秀',
      good: '良好',
      average: '一般',
      poor: '较差'
    };
    return map[rating];
  };

  const ratingBadgeClass = (rating: ServiceEvaluationRating | null) => {
    switch (rating) {
      case 'excellent': return 'badge-success';
      case 'good': return 'badge-primary';
      case 'average': return 'badge-warning';
      case 'poor': return 'badge-error';
      default: return 'badge-info';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-800">
          服务质量复盘
        </h1>
        <p className="text-slate-500">按岗位记录志愿者服务质量情况</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">总人数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.normal}</p>
          <p className="text-sm text-slate-500">正常</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
          <p className="text-sm text-slate-500">迟到</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.earlyLeave}</p>
          <p className="text-sm text-slate-500">早退</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
          <p className="text-sm text-slate-500">缺勤</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-sm text-slate-600 mr-2">活动：</label>
          <select
            value={activityFilter}
            onChange={e => {
              setActivityFilter(e.target.value);
              setPositionFilter('all');
            }}
            className="input-field inline-block w-auto py-2 text-sm"
          >
            <option value="all">全部活动</option>
            {activities.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600 mr-2">岗位：</label>
          <select
            value={positionFilter}
            onChange={e => setPositionFilter(e.target.value)}
            className="input-field inline-block w-auto py-2 text-sm"
          >
            <option value="all">全部岗位</option>
            {filteredPositions.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>活动</th>
                <th>岗位</th>
                <th>排班时段</th>
                <th>质量类型</th>
                <th>迟到分钟</th>
                <th>早退分钟</th>
                <th>评价等级</th>
                <th>评语</th>
                <th>记录人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {confirmedRegistrations.map(reg => {
                const user = getUserById(reg.userId);
                const activity = getActivityById(reg.activityId);
                const position = getPositionById(reg.positionId);
                const record = getExistingRecord(reg.id);
                const recorder = record ? getUserById(record.recordedBy) : null;
                const isEditing = editingId === reg.id;

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
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-700 text-sm max-w-[160px] truncate">
                      {activity?.title}
                    </td>
                    <td>
                      <span className="badge badge-primary">{position?.name}</span>
                    </td>
                    <td className="text-sm text-slate-600 whitespace-nowrap">
                      {getTimeSlotDisplay(reg)}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editState?.qualityType || 'normal'}
                          onChange={e => setEditState(prev => prev ? { ...prev, qualityType: e.target.value as ServiceQualityType } : prev)}
                          className="input-field w-full py-1.5 text-sm"
                        >
                          <option value="normal">正常</option>
                          <option value="late">迟到</option>
                          <option value="early_leave">早退</option>
                          <option value="absent">缺勤</option>
                        </select>
                      ) : (
                        <span className={`badge ${qualityTypeBadgeClass(record?.qualityType || 'normal')}`}>
                          {qualityTypeLabel(record?.qualityType || 'normal')}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          disabled={editState?.qualityType !== 'late'}
                          value={editState?.lateMinutes ?? ''}
                          onChange={e => setEditState(prev => prev ? { ...prev, lateMinutes: e.target.value ? Number(e.target.value) : null } : prev)}
                          className="input-field w-20 py-1.5 text-sm disabled:bg-slate-100"
                          placeholder="0"
                        />
                      ) : (
                        <span className="text-sm text-slate-700">
                          {record?.qualityType === 'late' && record.lateMinutes ? `${record.lateMinutes}分钟` : '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          disabled={editState?.qualityType !== 'early_leave'}
                          value={editState?.earlyLeaveMinutes ?? ''}
                          onChange={e => setEditState(prev => prev ? { ...prev, earlyLeaveMinutes: e.target.value ? Number(e.target.value) : null } : prev)}
                          className="input-field w-20 py-1.5 text-sm disabled:bg-slate-100"
                          placeholder="0"
                        />
                      ) : (
                        <span className="text-sm text-slate-700">
                          {record?.qualityType === 'early_leave' && record.earlyLeaveMinutes ? `${record.earlyLeaveMinutes}分钟` : '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editState?.rating || ''}
                          onChange={e => setEditState(prev => prev ? { ...prev, rating: e.target.value as ServiceEvaluationRating || null } : prev)}
                          className="input-field w-full py-1.5 text-sm"
                        >
                          <option value="">未评级</option>
                          <option value="excellent">优秀</option>
                          <option value="good">良好</option>
                          <option value="average">一般</option>
                          <option value="poor">较差</option>
                        </select>
                      ) : (
                        <span className={`badge ${ratingBadgeClass(record?.rating ?? null)}`}>
                          {ratingLabel(record?.rating ?? null)}
                        </span>
                      )}
                    </td>
                    <td className="max-w-[180px]">
                      {isEditing ? (
                        <textarea
                          value={editState?.comment || ''}
                          onChange={e => setEditState(prev => prev ? { ...prev, comment: e.target.value } : prev)}
                          rows={2}
                          className="input-field w-full py-1.5 text-sm"
                          placeholder="请输入评语..."
                        />
                      ) : (
                        <span className="text-sm text-slate-600 line-clamp-2">
                          {record?.comment || '-'}
                        </span>
                      )}
                    </td>
                    <td className="text-sm text-slate-500 whitespace-nowrap">
                      {recorder?.name || '-'}
                      {record?.recordedAt && (
                        <div className="text-xs text-slate-400">{formatDateTime(record.recordedAt)}</div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSave(reg.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="保存"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="取消"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(reg.id)}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title={record ? '编辑' : '记录'}
                        >
                          <ClipboardCheck size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {confirmedRegistrations.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">暂无已录取的志愿者</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceReview;
