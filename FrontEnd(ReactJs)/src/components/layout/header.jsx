import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../store/authSlice.js";
import { BrandLogo, Button } from "../ui/index.jsx";

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onDocumentClick = (event) => {
      const target = event.target;
      if (target && !target.closest?.("[data-avatar-menu]")) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  const avatarInitial = useMemo(() => {
    const source =
      user?.profile?.fullName || user?.username || user?.email || "U";
    return source.trim().charAt(0).toUpperCase();
  }, [user]);

  const avatarSrc =
    user?.profile?.avatarUrl && user.profile.avatarUrl !== "default-avatar.png"
      ? user.profile.avatarUrl
      : "";

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/60 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="shrink-0 transition-transform hover:scale-105"
        >
          <BrandLogo size="sm" />
        </button>

        <div className="hidden md:flex items-center gap-2 rounded-full bg-white/80 shadow-sm px-2 py-1.5 border border-gray-100">
          <button
            onClick={() => navigate("/home")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${isActive("/home")
              ? "bg-brand-50 text-brand-700 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
              }`}
          >
            Trang chủ
          </button>
          <button
            onClick={() => navigate("/courses")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${isActive("/courses")
              ? "bg-brand-50 text-brand-700 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
              }`}
          >
            Khóa học
          </button>
          <button
            onClick={() => navigate("/profile")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${isActive("/profile")
              ? "bg-brand-50 text-brand-700 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
              }`}
          >
            Hồ sơ
          </button>
        </div>

        <div className="relative" data-avatar-menu>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 rounded-full bg-white/80 border border-brand-100 shadow-sm px-2.5 py-1.5 hover:shadow-md transition-all active:scale-95"
          >
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[180px] truncate">
              {user?.profile?.fullName || user?.username || "Tài khoản"}
            </span>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{avatarInitial}</span>
              )}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-white bg-white/90 backdrop-blur-2xl shadow-[0_20px_40px_rgb(0,0,0,0.1)] overflow-hidden animate-fade-in">
              <div className="h-24 bg-gradient-to-r from-brand-500 to-teal-500" />
              <div className="px-5 pb-5 -mt-12">
                <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-brand-700 mx-auto">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{avatarInitial}</span>
                  )}
                </div>
                <div className="text-center mt-3">
                  <h3 className="font-display text-xl font-bold text-gray-900">
                    {user?.profile?.fullName || user?.username || "Tài khoản"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                </div>
                <div className="mt-6 space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => navigate("/profile")}
                  >
                    Xem hồ sơ
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-center text-red-600 border-red-100 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
