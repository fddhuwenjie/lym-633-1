import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, FileDown, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const currentUser = useUserStore(state => state.getCurrentUser());
  const users = useUserStore(state => state.users);
  const setCurrentUser = useUserStore(state => state.setCurrentUser);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSwitchUser = (userId: string) => {
    setCurrentUser(userId);
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">志</span>
              </div>
              <span className="font-serif text-xl font-semibold text-slate-800">
                志愿服务平台
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/') && !isActive('/activity') && !isActive('/profile') && !isActive('/export') && !isActive('/admin')
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home size={18} />
                <span>活动看板</span>
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User size={18} />
                <span>个人档案</span>
              </Link>
              <Link
                to="/export"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/export')
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileDown size={18} />
                <span>工时导出</span>
              </Link>
              {currentUser && (currentUser.role === 'organizer' || currentUser.role === 'manager') && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-accent-50 text-accent-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Settings size={18} />
                  <span>管理后台</span>
                </Link>
              )}
            </nav>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-full bg-slate-200"
                />
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {currentUser?.name}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">切换账号（演示）</p>
                  </div>
                  <div className="py-1">
                    {users.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchUser(user.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                          currentUser?.id === user.id ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full"
                        />
                        <div className="text-left flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-slate-500">
                            {user.role === 'organizer' ? '组织者' : user.role === 'manager' ? '负责人' : '志愿者'}
                          </p>
                        </div>
                        {currentUser?.id === user.id && (
                          <span className="text-primary-600 text-xs">当前</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="md:hidden border-b border-slate-200 bg-white">
        <div className="flex items-center justify-around py-2">
          <Link to="/" className={`flex flex-col items-center gap-1 px-4 py-2 ${isActive('/') && !isActive('/profile') && !isActive('/export') ? 'text-primary-600' : 'text-slate-500'}`}>
            <Home size={20} />
            <span className="text-xs">活动</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center gap-1 px-4 py-2 ${isActive('/profile') ? 'text-primary-600' : 'text-slate-500'}`}>
            <User size={20} />
            <span className="text-xs">档案</span>
          </Link>
          <Link to="/export" className={`flex flex-col items-center gap-1 px-4 py-2 ${isActive('/export') ? 'text-primary-600' : 'text-slate-500'}`}>
            <FileDown size={20} />
            <span className="text-xs">导出</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© 2024 志愿服务管理平台 · 让志愿服务更有温度</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
