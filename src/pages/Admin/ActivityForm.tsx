import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useActivityStore } from '../../store/useActivityStore';
import { useUserStore } from '../../store/useUserStore';
import { Position, ActivityStatus } from '../../types';
import { generateId } from '../../utils/idGenerator';

const ActivityForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { getActivityById, getPositionsByActivityId, addActivity, updateActivity, addPosition, updatePosition, deletePosition } = useActivityStore();
  const { users } = useUserStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    location: '',
    startTime: '',
    endTime: '',
    status: 'draft' as ActivityStatus,
  });

  const [positions, setPositions] = useState<Position[]>([]);
  const [newPosition, setNewPosition] = useState({
    name: '',
    description: '',
    totalQuota: 1,
    requirements: '' as string | string[],
    responsibleId: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      const activity = getActivityById(id);
      if (activity) {
        setFormData({
          title: activity.title,
          description: activity.description,
          coverImage: activity.coverImage,
          location: activity.location,
          startTime: activity.startTime.slice(0, 16),
          endTime: activity.endTime.slice(0, 16),
          status: activity.status,
        });
      }

      const activityPositions = getPositionsByActivityId(id);
      setPositions(activityPositions.map(p => ({
        ...p,
        requirements: p.requirements as unknown as string[]
      })));
    }
  }, [isEdit, id]);

  const managers = users.filter(u => u.role === 'manager' || u.role === 'organizer');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPosition = () => {
    if (!newPosition.name.trim()) return;
    
    const requirementsArray = typeof newPosition.requirements === 'string'
      ? newPosition.requirements.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
      : newPosition.requirements;

    const pos: Position = {
      id: generateId(),
      activityId: id || '',
      name: newPosition.name,
      description: newPosition.description,
      totalQuota: newPosition.totalQuota,
      requirements: requirementsArray,
      responsibleId: newPosition.responsibleId || managers[0]?.id || ''
    };

    setPositions([...positions, pos]);
    setNewPosition({
      name: '',
      description: '',
      totalQuota: 1,
      requirements: '',
      responsibleId: ''
    });
  };

  const handleRemovePosition = (posId: string) => {
    setPositions(positions.filter(p => p.id !== posId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const organizerId = users.find(u => u.role === 'organizer')?.id || '';

    if (isEdit && id) {
      updateActivity(id, {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      });

      const existingPositions = getPositionsByActivityId(id);
      
      positions.forEach(pos => {
        const exists = existingPositions.find(p => p.id === pos.id);
        if (exists) {
          updatePosition(pos.id, pos);
        } else {
          addPosition({ ...pos, activityId: id });
        }
      });

      existingPositions.forEach(ep => {
        if (!positions.find(p => p.id === ep.id)) {
          deletePosition(ep.id);
        }
      });

    } else {
      const newActivity = addActivity({
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        organizerId,
      });

      positions.forEach(pos => {
        addPosition({ ...pos, activityId: newActivity.id });
      });
    }

    navigate('/admin/activities');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <button
        onClick={() => navigate('/admin/activities')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>返回活动列表</span>
      </button>

      <div className="card">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-serif font-bold text-slate-800">
            {isEdit ? '编辑活动' : '新建活动'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            填写活动基本信息并设置招募岗位
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">基本信息</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  活动名称 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  活动描述 *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  封面图片URL
                </label>
                <input
                  type="text"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://..."
                />
                {formData.coverImage && (
                  <img
                    src={formData.coverImage}
                    alt="预览"
                    className="mt-2 w-full h-40 object-cover rounded-lg"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  活动地点 *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  活动状态
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="draft">草稿</option>
                  <option value="recruiting">招募中</option>
                  <option value="ongoing">进行中</option>
                  <option value="ended">已结束</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  开始时间 *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  结束时间 *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">招募岗位</h3>
              <span className="text-sm text-slate-500">{positions.length} 个岗位</span>
            </div>

            <div className="space-y-3 mb-4">
              {positions.map((pos, idx) => (
                <div key={pos.id} className="p-4 bg-slate-50 rounded-xl flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-slate-800">{pos.name}</span>
                      <span className="badge badge-primary">{pos.totalQuota} 人</span>
                    </div>
                    {pos.description && (
                      <p className="text-sm text-slate-600 mb-2">{pos.description}</p>
                    )}
                    {pos.requirements && pos.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pos.requirements.map(req => (
                          <span key={req} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white border border-slate-200 text-slate-600">
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePosition(pos.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
              <p className="text-sm font-medium text-slate-600">添加新岗位</p>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="岗位名称"
                    value={newPosition.name}
                    onChange={e => setNewPosition(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="人数"
                    value={newPosition.totalQuota}
                    onChange={e => setNewPosition(prev => ({ ...prev, totalQuota: parseInt(e.target.value) || 1 }))}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <select
                    value={newPosition.responsibleId}
                    onChange={e => setNewPosition(prev => ({ ...prev, responsibleId: e.target.value }))}
                    className="input-field text-sm"
                  >
                    <option value="">选择负责人</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="岗位要求（用逗号分隔，如：急救培训,摄影）"
                  value={typeof newPosition.requirements === 'string' ? newPosition.requirements : newPosition.requirements.join(',')}
                  onChange={e => setNewPosition(prev => ({ ...prev, requirements: e.target.value }))}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <textarea
                  placeholder="岗位描述"
                  value={newPosition.description}
                  onChange={e => setNewPosition(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="input-field text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddPosition}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                添加岗位
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/admin/activities')}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={18} />
              {isEdit ? '保存修改' : '创建活动'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;
