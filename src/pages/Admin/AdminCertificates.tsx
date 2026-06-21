import { useState, useMemo } from 'react';
import { Award, RotateCcw, Search, FileText, X } from 'lucide-react';
import { useCertificateStore } from '../../store/useCertificateStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useUserStore } from '../../store/useUserStore';
import { formatDateTime, formatDate } from '../../utils/date';

const AdminCertificates = () => {
  const { certificates, revokeCertificate, getCertificateById } = useCertificateStore();
  const { activities, getActivityById } = useActivityStore();
  const { users, getUserById } = useUserStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      if (statusFilter !== 'all' && cert.status !== statusFilter) return false;
      
      if (searchTerm) {
        const user = getUserById(cert.userId);
        const activity = getActivityById(cert.activityId);
        const search = searchTerm.toLowerCase();
        return (
          cert.certificateNo.toLowerCase().includes(search) ||
          user?.name.toLowerCase().includes(search) ||
          activity?.title.toLowerCase().includes(search)
        );
      }
      
      return true;
    }).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [certificates, searchTerm, statusFilter]);

  const handleRevoke = (certId: string) => {
    revokeCertificate(certId);
    setShowRevokeModal(null);
  };

  const statusBadgeClass = (status: string) => {
    return status === 'valid' ? 'badge-success' : 'badge-error';
  };

  const statusLabel = (status: string) => {
    return status === 'valid' ? '有效' : '已撤销';
  };

  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === 'valid').length,
    revoked: certificates.filter(c => c.status === 'revoked').length,
    totalHours: certificates
      .filter(c => c.status === 'valid')
      .reduce((sum, c) => sum + c.hours, 0)
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-800">
          证书管理
        </h1>
        <p className="text-slate-500">管理志愿服务证书的签发和撤销</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">证书总数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
          <p className="text-sm text-slate-500">有效证书</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.revoked}</p>
          <p className="text-sm text-slate-500">已撤销</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.totalHours.toFixed(1)}h</p>
          <p className="text-sm text-slate-500">认证总时长</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜索证书编号、志愿者、活动..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'valid', 'revoked'].map(status => (
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
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>证书编号</th>
                <th>志愿者</th>
                <th>活动</th>
                <th>服务时长</th>
                <th>签发日期</th>
                <th>签发人</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map(cert => {
                const user = getUserById(cert.userId);
                const activity = getActivityById(cert.activityId);
                const issuer = getUserById(cert.issuerId);
                
                return (
                  <tr key={cert.id}>
                    <td className="font-mono text-sm text-primary-700 font-medium">
                      {cert.certificateNo}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-slate-800">{user?.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-700 text-sm max-w-[200px] truncate">
                      {activity?.title}
                    </td>
                    <td>
                      <span className="font-semibold text-primary-600">{cert.hours}</span>
                      <span className="text-sm text-slate-500 ml-1">小时</span>
                    </td>
                    <td className="text-sm text-slate-500">
                      {formatDate(cert.issueDate)}
                    </td>
                    <td className="text-sm text-slate-500">
                      {issuer?.name}
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass(cert.status)}`}>
                        {statusLabel(cert.status)}
                      </span>
                    </td>
                    <td>
                      {cert.status === 'valid' && (
                        <button
                          onClick={() => setShowRevokeModal(cert.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="撤销证书"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <Award className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">暂无证书记录</p>
          </div>
        )}
      </div>

      {showRevokeModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRevokeModal(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <X className="text-red-500" size={20} />
                撤销证书
              </h3>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>警告：</strong>撤销后证书将标记为无效，但证书编号不会被回收。此操作不可撤销。
              </p>
            </div>
            
            {(() => {
              const cert = getCertificateById(showRevokeModal);
              const user = cert ? getUserById(cert.userId) : null;
              return (
                <div className="space-y-2 mb-6 text-sm">
                  <p>
                    <span className="text-slate-500">证书编号：</span>
                    <span className="font-medium font-mono">{cert?.certificateNo}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">持证人：</span>
                    <span className="font-medium">{user?.name}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">服务时长：</span>
                    <span className="font-medium">{cert?.hours} 小时</span>
                  </p>
                </div>
              );
            })()}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRevokeModal(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleRevoke(showRevokeModal)}
                className="btn-danger"
              >
                确认撤销
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
