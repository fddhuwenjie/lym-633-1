import { useState, useMemo } from 'react';
import { FileDown, Download, History, Search } from 'lucide-react';
import Papa from 'papaparse';
import { useUserStore } from '../../store/useUserStore';
import { useWorkHourStore } from '../../store/useWorkHourStore';
import { useCertificateStore } from '../../store/useCertificateStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useRegistrationStore } from '../../store/useRegistrationStore';
import { useServiceQualityStore } from '../../store/useServiceQualityStore';
import { useExportStore } from '../../store/useExportStore';
import { formatDate, formatDateTime, formatTime } from '../../utils/date';

const ExportPage = () => {
  const { getCurrentUser } = useUserStore();
  const { getWorkHoursByUserId, workHours } = useWorkHourStore();
  const { getCertificateByWorkHourId } = useCertificateStore();
  const { getActivityById, activities, getTimeSlotsByIds } = useActivityStore();
  const { getRegistrationById } = useRegistrationStore();
  const { getRecordsByRegistrationId } = useServiceQualityStore();
  const { addExportRecord, getExportHistoryByUserId } = useExportStore();

  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showHistory, setShowHistory] = useState(false);

  const currentUser = getCurrentUser();

  const userWorkHours = useMemo(() => {
    if (!currentUser) return [];
    return getWorkHoursByUserId(currentUser.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, workHours]);

  const userActivities = useMemo(() => {
    const activityIds = new Set(userWorkHours.map(wh => wh.activityId));
    return activities.filter(a => activityIds.has(a.id));
  }, [userWorkHours, activities]);

  const filteredWorkHours = useMemo(() => {
    return userWorkHours.filter(wh => {
      if (activityFilter !== 'all' && wh.activityId !== activityFilter) return false;
      if (statusFilter !== 'all' && wh.status !== statusFilter) return false;

      if (dateRange.start && wh.submittedAt) {
        if (new Date(wh.submittedAt) < new Date(dateRange.start)) return false;
      }
      if (dateRange.end && wh.submittedAt) {
        if (new Date(wh.submittedAt) > new Date(dateRange.end + 'T23:59:59')) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime());
  }, [userWorkHours, activityFilter, statusFilter, dateRange]);

  const exportHistory = currentUser ? getExportHistoryByUserId(currentUser.id) : [];

  const handleExport = () => {
    if (!currentUser || filteredWorkHours.length === 0) return;

    const qualityTypeMap: Record<string, string> = {
      late: '迟到',
      early_leave: '早退',
      absent: '缺勤',
      normal: '正常'
    };

    const ratingMap: Record<string, string> = {
      excellent: '优秀',
      good: '良好',
      average: '一般',
      poor: '较差'
    };

    const exportData = filteredWorkHours.map(wh => {
      const activity = getActivityById(wh.activityId);
      const cert = getCertificateByWorkHourId(wh.id);
      const reg = getRegistrationById(wh.registrationId);
      const positions = useActivityStore.getState().getPositionsByActivityId(wh.activityId);
      const position = positions.find(p => p.id === reg?.positionId);
      const timeSlots = reg ? getTimeSlotsByIds(reg.selectedTimeSlotIds) : [];
      const qualityRecords = reg ? getRecordsByRegistrationId(reg.id) : [];

      const statusMap: Record<string, string> = {
        draft: '草稿',
        pending: '待审核',
        approved: '已通过',
        rejected: '已退回'
      };

      const timeSlotStr = timeSlots
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map(slot => `${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`)
        .join(';');

      const qualityTypes = Array.from(new Set(qualityRecords.map(r => r.qualityType)));
      const qualityTypeStr = qualityTypes
        .map(type => qualityTypeMap[type] || type)
        .join(';');

      const ratings = Array.from(new Set(qualityRecords.map(r => r.rating).filter(Boolean) as string[]));
      const ratingStr = ratings
        .map(r => ratingMap[r] || r)
        .join(';');

      return {
        '活动名称': activity?.title || '',
        '岗位名称': position?.name || '',
        '排班时段': timeSlotStr,
        '服务时长(小时)': wh.hours,
        '建议时长(小时)': wh.suggestedHours !== null ? wh.suggestedHours : '',
        '异常类型': qualityTypeStr,
        '评价等级': ratingStr,
        '审核状态': statusMap[wh.status] || wh.status,
        '证书编号': cert?.certificateNo || '暂无',
        '提交时间': wh.submittedAt ? formatDateTime(wh.submittedAt) : '',
        '审核时间': wh.reviewedAt ? formatDateTime(wh.reviewedAt) : '',
        '生成时间': cert?.issueDate ? formatDateTime(cert.issueDate) : '无'
      };
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `工时记录_${formatDate(new Date().toISOString())}.csv`;

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const filters = JSON.stringify({ activityFilter, statusFilter, dateRange });
    addExportRecord({
      userId: currentUser.id,
      fileName,
      recordCount: filteredWorkHours.length,
      filters
    });
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

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-error';
      default: return 'badge-info';
    }
  };

  if (!currentUser) {
    return <div className="text-center py-16">请先登录</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">
            工时导出
          </h1>
          <p className="text-slate-500">导出您的志愿服务工时记录</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-secondary flex items-center gap-2"
        >
          <History size={18} />
          导出历史
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Search size={18} className="text-primary-600" />
              筛选条件
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  活动筛选
                </label>
                <select
                  value={activityFilter}
                  onChange={e => setActivityFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">全部活动</option>
                  {userActivities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  审核状态
                </label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">全部状态</option>
                  <option value="draft">草稿</option>
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已退回</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  开始日期
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  结束日期
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="input-field"
                />
              </div>

              <button
                onClick={handleExport}
                disabled={filteredWorkHours.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FileDown size={18} />
                导出 {filteredWorkHours.length} 条记录
              </button>
            </div>
          </div>

          <div className="card p-5 bg-primary-50 border-primary-200">
            <h3 className="font-semibold text-primary-800 mb-3">导出说明</h3>
            <ul className="text-sm text-primary-700 space-y-1.5">
              <li>• 导出格式为 CSV，可用 Excel 打开</li>
              <li>• 包含活动、岗位、排班时段、服务时长、建议时长、异常类型、评价等级、审核状态、证书编号等</li>
              <li>• 仅导出符合筛选条件的记录</li>
              <li>• 导出记录将保存在历史中可复查</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                工时记录列表
                <span className="ml-2 text-sm font-normal text-slate-500">
                  共 {filteredWorkHours.length} 条
                </span>
              </h3>
            </div>

            {filteredWorkHours.length === 0 ? (
              <div className="text-center py-12">
                <FileDown className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">暂无符合条件的工时记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>活动名称</th>
                      <th>排班时段</th>
                      <th>服务时长</th>
                      <th>建议时长</th>
                      <th>异常类型</th>
                      <th>评价等级</th>
                      <th>审核状态</th>
                      <th>证书编号</th>
                      <th>提交时间</th>
                      <th>生成时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkHours.map(wh => {
                      const activity = getActivityById(wh.activityId);
                      const cert = getCertificateByWorkHourId(wh.id);
                      const reg = getRegistrationById(wh.registrationId);
                      const timeSlots = reg ? getTimeSlotsByIds(reg.selectedTimeSlotIds) : [];
                      const qualityRecords = reg ? getRecordsByRegistrationId(reg.id) : [];

                      const qualityTypeMap: Record<string, string> = {
                        late: '迟到',
                        early_leave: '早退',
                        absent: '缺勤',
                        normal: '正常'
                      };

                      const ratingMap: Record<string, string> = {
                        excellent: '优秀',
                        good: '良好',
                        average: '一般',
                        poor: '较差'
                      };

                      const timeSlotStr = timeSlots
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(slot => `${formatTime(slot.startTime)}-${formatTime(slot.endTime)}`)
                        .join(';');

                      const qualityTypes = Array.from(new Set(qualityRecords.map(r => r.qualityType)));
                      const qualityTypeStr = qualityTypes
                        .map(type => qualityTypeMap[type] || type)
                        .join(';');

                      const ratings = Array.from(new Set(qualityRecords.map(r => r.rating).filter(Boolean) as string[]));
                      const ratingStr = ratings
                        .map(r => ratingMap[r] || r)
                        .join(';');

                      return (
                        <tr key={wh.id}>
                          <td className="font-medium text-slate-800">
                            {activity?.title}
                          </td>
                          <td className="text-sm text-slate-600">
                            {timeSlotStr || '-'}
                          </td>
                          <td>
                            <span className="font-semibold text-primary-600">
                              {wh.hours}
                            </span>
                            <span className="text-sm text-slate-500 ml-1">小时</span>
                          </td>
                          <td className="text-sm text-slate-600">
                            {wh.suggestedHours !== null ? (
                              <>
                                <span className="font-semibold text-primary-600">
                                  {wh.suggestedHours}
                                </span>
                                <span className="text-sm text-slate-500 ml-1">小时</span>
                              </>
                            ) : '-'}
                          </td>
                          <td className="text-sm text-slate-600">
                            {qualityTypeStr || '-'}
                          </td>
                          <td className="text-sm text-slate-600">
                            {ratingStr || '-'}
                          </td>
                          <td>
                            <span className={`badge ${statusBadgeClass(wh.status)}`}>
                              {statusLabel(wh.status)}
                            </span>
                          </td>
                          <td className="text-sm text-slate-600 font-mono">
                            {cert?.certificateNo || '-'}
                          </td>
                          <td className="text-sm text-slate-500">
                            {wh.submittedAt ? formatDateTime(wh.submittedAt) : '-'}
                          </td>
                          <td className="text-sm text-slate-500">
                            {cert?.issueDate ? formatDateTime(cert.issueDate) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                <History size={20} className="text-primary-600" />
                导出历史
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh] scrollbar-thin">
              {exportHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500">暂无导出记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exportHistory.map(record => {
                    const filters = JSON.parse(record.filters || '{}');
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Download size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{record.fileName}</p>
                            <p className="text-sm text-slate-500">
                              {record.recordCount} 条记录 · {formatDateTime(record.exportTime)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-400">
                          {filters.activityFilter && filters.activityFilter !== 'all' && (
                            <p>活动：{getActivityById(filters.activityFilter)?.title || '-'}</p>
                          )}
                          {filters.statusFilter && filters.statusFilter !== 'all' && (
                            <p>状态：{statusLabel(filters.statusFilter)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPage;
