import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Clock, 
  Award, 
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const currentUser = useUserStore(state => state.getCurrentUser());

  const isActive = (path: string) => {
    return location.pathname === `/admin${path}` || location.pathname.startsWith(`/admin${path}/`);
  };

  const menuItems = [
    { path: '', icon: LayoutDashboard, label: '数据概览' },
    { path: '/activities', icon: Calendar, label: '活动管理' },
    { path: '/registrations', icon: Users, label: '报名管理' },
    { path: '/workhours', icon: Clock, label: '工时审核' },
    { path: '/certificates', icon: Award, label: '证书管理' },
  ];

  const filteredMenuItems = currentUser?.role === 'manager'
    ? menuItems.filter(item => item.path !== '/activities' && item.path !== '/certificates')
    : menuItems;

  return (
    <div className="min-h-screen bg-slate-100">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">管</span>
              </div>
              <span className="font-serif text-lg font-semibold text-slate-800">
                管理后台
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-100 rounded"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
            {filteredMenuItems.map(item => (
              <Link
                key={item.path}
                to={`/admin${item.path}`}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-200">
            <button
              onClick={() => navigate('/')}
              className="sidebar-item w-full"
            >
              <ArrowLeft size={20} />
              <span>返回前台</span>
            </button>
            
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500">
                    {currentUser?.role === 'organizer' ? '组织者' : currentUser?.role === 'manager' ? '负责人' : '志愿者'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
