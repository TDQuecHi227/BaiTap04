import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateProfile,
  logoutUser,
  clearMessages,
} from "../store/authSlice";
import { Header } from "../components/layout/header.jsx";
import { InputField, Button, Alert, Spinner } from "../components/ui/index.jsx";
import { uploadImageApi } from "../util/api";

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, successMsg } = useSelector(
    (s) => s.auth,
  );

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);


  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.profile?.fullName || "",
        bio: user.profile?.bio || "",
        phoneNumber: user.profile?.phoneNumber || "",
      });
    }
  }, [user]);

  useEffect(() => () => dispatch(clearMessages()), [dispatch]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ và tên";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    dispatch(updateProfile(form)).then((action) => {
      if (!action.error) setEditMode(false);
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng và dung lượng (giới hạn 2MB)
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp ảnh!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Dung lượng ảnh không được vượt quá 2MB!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const res = await uploadImageApi(formData);
      if (res.url) {
        // Sau khi upload lên Cloudinary thành công, cập nhật URL vào profile
        await dispatch(updateProfile({ avatarUrl: res.url }));
      }
    } catch (err) {
      console.error("Lỗi upload:", err);
      alert("Tải ảnh lên thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-teal-50">
        <div className="text-center space-y-3">
          <Spinner size={36} className="text-brand-600 mx-auto" />
          <p className="text-gray-500 text-sm">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  const avatarInitial = (user?.profile?.fullName ||
    user?.username ||
    "U")[0].toUpperCase();
  const avatarSrc =
    user?.profile?.avatarUrl && user.profile.avatarUrl !== "default-avatar.png"
      ? user.profile.avatarUrl
      : "";
  const roleLabel = user?.role === "admin" ? "Quản trị viên" : "Học viên";
  const roleBadge =
    user?.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : "bg-brand-100 text-brand-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50/30">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
          <div className="bg-white rounded-3xl shadow-xl shadow-brand-100/40 border border-brand-100/60 overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-brand-500 to-teal-500 relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
            </div>

            <div className="px-8 pb-8 pt-4 relative">
              <div className="flex justify-end mb-4">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${roleBadge}`}
                >
                  {roleLabel}
                </span>
              </div>

              <div className="absolute -top-12 left-8 w-24 h-24 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-white group cursor-pointer">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <Spinner size={24} className="text-brand-600" />
                  </div>
                ) : (
                  <>
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user?.profile?.fullName || user?.username || "Avatar"}
                        className="w-full h-full object-cover transition-filter group-hover:brightness-75"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-teal-50 text-3xl font-bold font-display text-brand-700 transition-filter group-hover:brightness-95">
                        {avatarInitial}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">Đổi ảnh</span>
                    </div>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleAvatarChange}
                      accept="image/*"
                    />
                  </>
                )}
              </div>

              <div className="pt-10">
                <h2 className="font-display text-2xl font-bold text-gray-900 leading-tight">
                  {user?.profile?.fullName || user?.username || "—"}
                </h2>
                <p className="text-gray-500 text-sm">@{user?.username}</p>
                {user?.profile?.bio && (
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {user.profile.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                {user?.email && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span>📧</span> {user.email}
                  </div>
                )}
                {user?.profile?.phoneNumber && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span>📞</span> {user.profile.phoneNumber}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>{user?.isVerified ? "✅" : "⏳"}</span>
                  {user?.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-brand-100/40 border border-brand-100/60 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-gray-900">
                Chỉnh sửa hồ sơ
              </h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-ghost text-sm"
                >
                  ✏️ Chỉnh sửa
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4">
                <Alert
                  type="error"
                  message={error}
                  onClose={() => dispatch(clearMessages())}
                />
              </div>
            )}
            {successMsg && (
              <div className="mb-4">
                <Alert type="success" message={successMsg} />
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <InputField
                label="Họ và tên"
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={handleChange("fullName")}
                error={errors.fullName}
                disabled={!editMode}
              />

              <div className="space-y-1">
                <label className="label-text">Giới thiệu bản thân</label>
                <textarea
                  className={`input-base resize-none min-h-[90px] ${!editMode ? "opacity-60" : ""}`}
                  placeholder="Học tiếng Anh để..."
                  value={form.bio}
                  onChange={handleChange("bio")}
                  disabled={!editMode}
                  rows={3}
                />
              </div>

              <InputField
                label="Số điện thoại"
                type="tel"
                placeholder="0901234567"
                value={form.phoneNumber}
                onChange={handleChange("phoneNumber")}
                error={errors.phoneNumber}
                disabled={!editMode}
              />

              {editMode && (
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={loading} className="flex-1">
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setEditMode(false);
                      dispatch(clearMessages());
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-red-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-3">Phiên làm việc</h3>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="max-w-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              🚪 Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
