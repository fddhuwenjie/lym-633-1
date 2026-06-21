import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Users, ArrowLeft, Calendar, 
  AlertCircle, CheckCircle, XCircle, Clock3
} from 'lucide-react';
import { useActivityStore } from '../../store/useActivityStore';
import { useUserStore } from '../../store/useUserStore';
import { useRegistrationStore } from '../../store/useRegistrationStore';
import { useCheckinStore } from '../../store/useCheckinStore';
import { useWorkHourStore } from '../../store/useWorkHourStore';
import { formatDateTime, formatTime } from '../../utils/date';
import { validatePositionRequirements, validateTimeConflict, validateActivityNotEnded } from '../../utils/validator';

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { getActivityById, getPositionsByActivityId, getPositionById, activities } = useActivityStore();
  const { getCurrentUser, users } = useUserStore();
  const { 
    addRegistration, 
    cancelRegistration, 
    hasUserRegistered, 
    getRegistrationsByActivityId,
    getRegistrationById,
    confirmRegistration,
    registrations,
    getConfirmedCountByPosition,
    getWaitlistCountByPosition
  } = useRegistrationStore();
  const { 
    getCheckinByRegistrationId, 
    checkIn, 
    checkOut,
    createCheckin,
    calculateWorkHours
  } = useCheckinStore();
  const { addWorkHour, submitWorkHour, getWorkHourByRegistrationId } = useWorkHourStore();
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const activity = getActivityById(id || '');
  const positions = getPositionsByActivityId(id || '');
  const currentUser = getCurrentUser();

  if (!activity) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">活动不存在</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          返回活动列表
        </button>
      </div>
    );
  }

  const handleSignUp = (positionId: string) => {
    if (!currentUser) {
      setErrorMessage('请先登录');
      return;
    }

    const position = getPositionById(positionId);
    if (!position) return;

    if (!validateActivityNotEnded(activity)) {
      setErrorMessage('活动已结束，无法报名');
      return;
    }

    if (activity.status !== 'recruiting') {
      setErrorMessage('当前活动不在招募期');
      return;
    }

    const { valid, missing } = validatePositionRequirements(currentUser, position);
    if (!valid) {
      setErrorMessage(`不满足岗位条件，缺少：${missing.join('、')}`);
      return;
    }

    const { hasConflict, conflictActivity } = validateTimeConflict(
      currentUser.id,
      activity,
      registrations,
      activities
    );
    if (hasConflict && conflictActivity) {
      setErrorMessage(`时段冲突：与「${conflictActivity.title}」时间重叠`);
      return;
    }

    if (hasUserRegistered(currentUser.id, activity.id)) {
      setErrorMessage('您已报名该活动');
      return;
    }

    const newReg = addRegistration({
      userId: currentUser.id,
      activityId: activity.id,
      positionId
    });

    if (newReg.status === 'waitlist') {
      setShowSuccess('报名成功，已进入候补队列');
    } else {
      setShowSuccess('报名成功，等待负责人确认');
    }
    
    setTimeout(() => setShowSuccess(null), 3000);
    setErrorMessage(null);
  };

  const handleCancelSignUp = (registrationId: string) => {
    cancelRegistration(registrationId);
    setShowSuccess('已取消报名');
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleCheckIn = (registrationId: string) => {
    createCheckin(registrationId, currentUser!.id);
    const result = checkIn(registrationId);
    if (result) {
      setShowSuccess('签到成功');
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  const handleCheckOut = (registrationId: string) => {
    const checkin = getCheckinByRegistrationId(registrationId);
    if (!checkin || !checkin.checkinTime) {
      setErrorMessage('请先签到');
      return;
    }

    const result = checkOut(registrationId);
    if (result) {
      setShowSuccess('签退成功');
      setTimeout(() => setShowSuccess(null), 3000);
    } else {
      setErrorMessage('签退失败');
    }
  };

  const handleSubmitHours = (registrationId: string) => {
    const checkin = getCheckinByRegistrationId(registrationId);
    if (!checkin || !checkin.checkinTime || !checkin.checkoutTime) return;

    const hours = calculateWorkHours(registrationId);
    const workHour = addWorkHour({
      registrationId,
      userId: currentUser!.id,
      activityId: activity.id,
      hours
    });

    submitWorkHour(workHour.id);
    setShowSuccess('工时已提交审核');
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleConfirmRegistration = (regId: string) => {
    confirmRegistration(regId);
    setShowSuccess('已确认录取');
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const userRegs = currentUser 
    ? getRegistrationsByActivityId(activity.id).filter(r => r.userId === currentUser.id)
    : [];

  const activityRegs = getRegistrationsByActivityId(activity.id);

  const isManagerOrOrganizer = currentUser && 
    (currentUser.role === 'organizer' || currentUser.role === 'manager');

  const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
    draft: { label: '草稿', className: 'bg-slate-100 text-slate-600', icon: Clock3 },
    recruiting: { label: '招募中', className: 'bg-green-100 text-green-700', icon: CheckCircle },
    ongoing: { label: '进行中', className: 'bg-blue-100 text-blue-700', icon: Clock },
    ended: { label: '已结束', className: 'bg-slate-100 text-slate-500', icon: CheckCircle },
    cancelled: { label: '已取消', className: 'bg-red-100 text-red-600', icon: XCircle },
  };

  const statusInfo = statusConfig[activity.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>返回活动列表</span>
      </button>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-red-800">报名失败</p>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
          <p className="text-green-800">{showSuccess}</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="relative h-64 md:h-80">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <span className={`badge ${statusInfo.className} flex items-center gap-1.5`}>
              <StatusIcon size={12} />
              {statusInfo.label}
            </span>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
              {activity.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                <span>{activity.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>{formatDateTime(activity.startTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>
                  {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">活动介绍</h2>
          <p className="text-slate-600 leading-relaxed">{activity.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-serif font-semibold text-slate-800 flex items-center gap-2">
          <Users size={22} className="text-primary-600" />
          招募岗位
        </h2>

        <div className="grid gap-4">
          {positions.map(position => {
            const confirmedCount = getConfirmedCountByPosition(position.id);
            const waitlistCount = getWaitlistCountByPosition(position.id);
            const progress = (confirmedCount / position.totalQuota) * 100;
            const isFull = confirmedCount >= position.totalQuota;
            
            const userReg = userRegs.find(r => r.positionId === position.id);
            const checkin = userReg ? getCheckinByRegistrationId(userReg.id) : null;
            const workHour = userReg ? getWorkHourByRegistrationId(userReg.id) : null;
            const responsible = users.find(u => u.id === position.responsibleId);
            
            const { valid: meetsRequirements } = currentUser 
              ? validatePositionRequirements(currentUser, position)
              : { valid: false };

            return (
              <div key={position.id} className="card p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{position.name}</h3>
                      <span className={`badge ${isFull ? 'badge-warning' : 'badge-success'}`}>
                        {isFull ? '已报满' : '招募中'}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-3">{position.description}</p>

                    {position.requirements.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-700 mb-1.5">岗位要求：</p>
                        <div className="flex flex-wrap gap-1.5">
                          {position.requirements.map(req => (
                            <span
                              key={req}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                currentUser && currentUser.skills.includes(req)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>负责人：{responsible?.name || '待指定'}</span>
                    </div>
                  </div>

                  <div className="md:w-48 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-slate-600">报名进度</span>
                        <span className="font-medium text-slate-800">
                          {confirmedCount}/{position.totalQuota} 人
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      {waitlistCount > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          候补 {waitlistCount} 人
                        </p>
                      )}
                    </div>

                    {currentUser && userReg ? (
                      <div className="space-y-2">
                        <div className={`badge w-full justify-center py-1.5 ${
                          userReg.status === 'confirmed' ? 'badge-success' :
                          userReg.status === 'waitlist' ? 'badge-warning' :
                          userReg.status === 'pending' ? 'badge-info' : 'badge-error'
                        }`}>
                          {userReg.status === 'confirmed' && '已录取'}
                          {userReg.status === 'waitlist' && `候补第${userReg.waitlistOrder}位`}
                          {userReg.status === 'pending' && '待确认'}
                          {userReg.status === 'cancelled' && '已取消'}
                          {userReg.status === 'rejected' && '已拒绝'}
                        </div>

                        {userReg.status === 'confirmed' && activity.status === 'ongoing' && (
                          <>
                            {checkin?.status === 'not_started' && (
                              <button
                                onClick={() => handleCheckIn(userReg.id)}
                                className="btn-primary w-full"
                              >
                                立即签到
                              </button>
                            )}
                            {checkin?.status === 'checked_in' && (
                              <button
                                onClick={() => handleCheckOut(userReg.id)}
                                className="btn-accent w-full"
                              >
                                立即签退
                              </button>
                            )}
                            {checkin?.status === 'checked_out' && !workHour && (
                              <button
                                onClick={() => handleSubmitHours(userReg.id)}
                                className="btn-primary w-full"
                              >
                                提交工时
                              </button>
                            )}
                            {workHour && (
                              <div className={`badge w-full justify-center py-1.5 ${
                                workHour.status === 'approved' ? 'badge-success' :
                                workHour.status === 'pending' ? 'badge-warning' :
                                workHour.status === 'rejected' ? 'badge-error' : 'badge-info'
                              }`}>
                                {workHour.status === 'approved' && '工时已确认'}
                                {workHour.status === 'pending' && '工时审核中'}
                                {workHour.status === 'rejected' && '工时已退回'}
                                {workHour.status === 'draft' && '工时草稿'}
                                {workHour.hours}小时
                              </div>
                            )}
                          </>
                        )}

                        {(userReg.status === 'pending' || userReg.status === 'waitlist') && (
                          <button
                            onClick={() => handleCancelSignUp(userReg.id)}
                            className="btn-secondary w-full text-sm"
                          >
                            取消报名
                          </button>
                        )}
                      </div>
                    ) : currentUser && activity.status === 'recruiting' ? (
                      <button
                        onClick={() => handleSignUp(position.id)}
                        disabled={!meetsRequirements}
                        className={`w-full ${
                          meetsRequirements ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {isFull ? '候补报名' : '立即报名'}
                      </button>
                    ) : null}

                    {isManagerOrOrganizer && userReg?.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmRegistration(userReg.id)}
                        className="btn-primary w-full"
                      >
                        确认录取
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isManagerOrOrganizer && (
        <div className="card p-6">
          <h2 className="text-xl font-serif font-semibold text-slate-800 mb-4">
            报名管理
          </h2>
          
          <div className="space-y-4">
            {['pending', 'confirmed', 'waitlist'].map(status => {
              const statusLabel = status === 'pending' ? '待确认' : status === 'confirmed' ? '已录取' : '候补中';
              const regs = activityRegs.filter(r => r.status === status);
              
              if (regs.length === 0) return null;
              
              return (
                <div key={status}>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    {statusLabel} ({regs.length}人)
                  </h3>
                  <div className="grid gap-2">
                    {regs.map(reg => {
                      const user = users.find(u => u.id === reg.userId);
                      const pos = positions.find(p => p.id === reg.positionId);
                      return (
                        <div 
                          key={reg.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={user?.avatar}
                              alt={user?.name}
                              className="w-9 h-9 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-slate-800">{user?.name}</p>
                              <p className="text-xs text-slate-500">{pos?.name}</p>
                            </div>
                          </div>
                          {status === 'pending' && (
                            <button
                              onClick={() => handleConfirmRegistration(reg.id)}
                              className="btn-primary text-sm py-1.5 px-3"
                            >
                              确认录取
                            </button>
                          )}
                          {status === 'waitlist' && (
                            <span className="text-xs text-amber-600">
                              第{reg.waitlistOrder}位
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetail;
