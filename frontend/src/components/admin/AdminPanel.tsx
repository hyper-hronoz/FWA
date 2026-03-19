import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil, Trash2, Plus, Save, X, Heart, Star,
  Filter, Search, Video, Loader2, Play, Camera
} from "lucide-react";
import type { Chan } from "@shared/Profile";

interface AdminPanelProps {
  initialProfiles: Chan[];
  onProfilesChange: (profiles: Chan[]) => void;
}

export default function AdminPanel({ initialProfiles, onProfilesChange }: AdminPanelProps) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Chan[]>(initialProfiles);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAge, setFilterAge] = useState<string>("all");

  const [editForm, setEditForm] = useState<Partial<Chan>>({});
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<'avatar' | 'video' | null>(null);
  const [interestsInput, setInterestsInput] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Синхронизация интересов при открытии формы
  useEffect(() => {
    if (editingId !== null || isAdding) {
      setInterestsInput(editForm.interests?.join(", ") || "");
    }
  }, [editingId, isAdding, editForm.interests]);

  // Передача изменений наверх (если всё ещё нужно для родительского компонента)
  useEffect(() => {
    onProfilesChange(profiles);
  }, [profiles, onProfilesChange]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Выберите изображение");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Максимум 5 МБ");
      return;
    }

    setUploading("avatar");
    const previewUrl = URL.createObjectURL(file);
    setPreviewAvatar(previewUrl);
    setAvatarFile(file);
    setUploading(null);

    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Выберите видео");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("Максимум 50 МБ");
      return;
    }

    setUploading("video");
    const previewUrl = URL.createObjectURL(file);
    setPreviewVideo(previewUrl);
    setVideoFile(file);
    setUploading(null);

    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const startEdit = (profile: Chan) => {
    setEditingId(profile.id);
    setEditForm(profile);
    setPreviewAvatar(profile.avatar);
    setPreviewVideo(profile.video);
    // При редактировании файлы не меняем, если не загружаем новые
    setAvatarFile(null);
    setVideoFile(null);
  };

  const isFormValid = () => {
    return (
      !!editForm.username?.trim() &&
      !!editForm.bio?.trim() &&
      typeof editForm.age === "number" &&
      editForm.age >= 18 &&
      editForm.age <= 120
    );
  };

  const handleAdd = async () => {
    if (!isFormValid()) {
      alert("Заполните все обязательные поля корректно");
      return;
    }

    const parsedInterests = interestsInput
      .split(/[\s,#]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const formData = new FormData();

    // Текстовые поля
    formData.append("username", editForm.username!.trim());
    formData.append("age", String(editForm.age!));
    formData.append("bio", editForm.bio!.trim());
    formData.append("favoriteAnime", (editForm.favoriteAnime || "Не указано").trim());
    formData.append("interests", JSON.stringify(parsedInterests));

    // Файлы
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    if (videoFile) {
      formData.append("video", videoFile);
    }

    console.log(formData)

    try {
      const response = await fetch("/api/chans", {  // ← поменяйте на ваш реальный endpoint
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Ошибка сервера: ${response.status}`);
      }

      const newChan = await response.json();  // ожидаем, что сервер вернёт созданный объект с id

      setProfiles(prev => [...prev, newChan]);
      cleanupForm();

      alert("Тянка успешно добавлена!");
    } catch (err: any) {
      console.error("Ошибка добавления тянки:", err);
      alert("Не удалось добавить тянку: " + (err.message || "неизвестная ошибка"));
    }
  };

  const handleSave = () => {
    // Пока оставляем локальное сохранение (можно реализовать аналогично handleAdd)
    if (!isFormValid() || editingId === null) return;

    const parsedInterests = interestsInput
      .split(/[\s,#]+/)
      .map(s => s.trim())
      .filter(Boolean);

    setProfiles(prev =>
      prev.map(p =>
        p.id === editingId
          ? { ...p, ...editForm, interests: parsedInterests }
          : p
      )
    );

    cleanupForm();
    alert("Изменения сохранены локально (реализуйте PUT/PATCH по аналогии с POST)");
  };

  const cleanupForm = () => {
    if (previewAvatar?.startsWith("blob:")) URL.revokeObjectURL(previewAvatar);
    if (previewVideo?.startsWith("blob:")) URL.revokeObjectURL(previewVideo);

    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
    setPreviewAvatar(null);
    setPreviewVideo(null);
    setAvatarFile(null);
    setVideoFile(null);
    setInterestsInput("");
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Удалить эту тянку?")) return;
    setProfiles(prev => prev.filter(p => p.id !== id));
    // TODO: добавить DELETE запрос на сервер
  };

  const filteredProfiles = profiles.filter(profile => {
    const term = searchTerm.toLowerCase();
    const matches =
      profile.username.toLowerCase().includes(term) ||
      profile.bio.toLowerCase().includes(term) ||
      profile.favoriteAnime.toLowerCase().includes(term);

    if (filterAge === "all") return matches;
    if (filterAge === "young") return profile.age < 20 && matches;
    if (filterAge === "medium") return profile.age >= 20 && profile.age < 25 && matches;
    if (filterAge === "mature") return profile.age >= 25 && matches;
    return matches;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-blue-900/30 p-6 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-8 text-6xl animate-pulse opacity-20">🌸</div>
        <div className="absolute bottom-20 right-12 text-7xl animate-float opacity-20 delay-500">✨</div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Заголовок и кнопка назад */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Админ-панель 👑
            </h1>
            <p className="text-gray-300 mt-1">Управление тянками</p>
          </div>
          <button
            onClick={() => navigate("/swipe")}
            className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white hover:bg-white/20 transition"
          >
            ← На свайпы
          </button>
        </div>

        {/* Форма добавления / редактирования */}
        {(isAdding || editingId !== null) && (
          <div className="bg-white/8 backdrop-blur-md rounded-2xl p-6 border border-pink-500/30 mb-10 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6">
              {isAdding ? "✨ Новая тянка" : "✏️ Редактирование"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Аватар */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Аватар</label>
                {previewAvatar ? (
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden group shadow-md">
                    <img src={previewAvatar} alt="avatar" className="object-cover w-full h-full" />
                    <button
                      onClick={() => {
                        if (previewAvatar.startsWith("blob:")) URL.revokeObjectURL(previewAvatar);
                        setPreviewAvatar(null);
                        setAvatarFile(null);
                        setEditForm(p => ({ ...p, avatar: undefined }));
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-600/90 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className={`w-48 h-48 rounded-xl border-2 border-dashed ${
                      uploading === "avatar" ? "border-pink-400" : "border-white/30"
                    } bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-pink-400/70 transition-all`}
                  >
                    {uploading === "avatar" ? (
                      <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-10 h-10 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-400">Загрузить фото</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Видео */}
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Видео-приветствие</label>
                {previewVideo ? (
                  <div className="relative w-full max-w-xs rounded-xl overflow-hidden group shadow-md">
                    <video src={previewVideo} controls className="w-full h-40 object-cover" />
                    <button
                      onClick={() => {
                        if (previewVideo.startsWith("blob:")) URL.revokeObjectURL(previewVideo);
                        setPreviewVideo(null);
                        setVideoFile(null);
                        setEditForm(p => ({ ...p, video: undefined }));
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-600/90 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className={`w-full max-w-xs h-40 rounded-xl border-2 border-dashed ${
                      uploading === "video" ? "border-pink-400" : "border-white/30"
                    } bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-pink-400/70 transition-all`}
                  >
                    {uploading === "video" ? (
                      <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
                    ) : (
                      <>
                        <Video className="w-10 h-10 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-400">Загрузить видео</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Остальные поля формы остаются без изменений */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-300 mb-1.5 font-medium">Имя</label>
                <input
                  value={editForm.username || ""}
                  onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
                  placeholder="Имя тянки"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1.5 font-medium">Возраст</label>
                <input
                  type="number"
                  min={18}
                  max={120}
                  value={editForm.age ?? ""}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === "") {
                      setEditForm(p => ({ ...p, age: undefined }));
                      return;
                    }
                    const n = parseInt(v, 10);
                    if (isNaN(n)) return;
                    setEditForm(p => ({ ...p, age: Math.max(18, Math.min(120, n)) }));
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
                  placeholder="18–120"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-1.5 font-medium">Био</label>
                <textarea
                  value={editForm.bio || ""}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 min-h-[100px] transition"
                  placeholder="Короткое описание..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-1.5 font-medium">Любимое аниме</label>
                <input
                  value={editForm.favoriteAnime || ""}
                  onChange={e => setEditForm(p => ({ ...p, favoriteAnime: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
                  placeholder="Например: Jujutsu Kaisen"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-1.5 font-medium">
                  Интересы (через запятую, пробел или #)
                </label>
                <input
                  value={interestsInput}
                  onChange={e => setInterestsInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
                  placeholder="аниме, косплей, #рисование, vtuber"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button
                onClick={cleanupForm}
                disabled={uploading !== null}
                className="px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
              >
                <X size={18} /> Отмена
              </button>
              <button
                onClick={isAdding ? handleAdd : handleSave}
                disabled={uploading !== null || !isFormValid()}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-medium hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : isAdding ? (
                  <Plus size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isAdding ? "Добавить" : "Сохранить"}
              </button>
            </div>
          </div>
        )}

        {/* Поиск + фильтры + кнопка добавить */}
        <div className="bg-white/8 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Поиск по имени, био, аниме..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
              />
            </div>

            <select
              value={filterAge}
              onChange={e => setFilterAge(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500 min-w-[180px]"
            >
              <option value="all">Все возрасты</option>
              <option value="young">До 20 лет</option>
              <option value="medium">20–24 года</option>
              <option value="mature">25+ лет</option>
            </select>

            {!isAdding && editingId === null && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-medium hover:brightness-110 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} /> Добавить тянку
              </button>
            )}
          </div>
        </div>

        {/* Список профилей */}
        <div className="space-y-5">
          {filteredProfiles.length === 0 && !isAdding && (
            <div className="text-center py-20">
              <p className="text-6xl mb-6">😿</p>
              <p className="text-xl text-gray-300 mb-6">Тянки по вашему запросу не найдены</p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-medium hover:brightness-110 transition"
              >
                Создать первую тянку
              </button>
            </div>
          )}

          {filteredProfiles.map(profile => (
            <div
              key={profile.id}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-pink-500/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 group">
                  {profile.avatar && (
                    <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                  )}
                  {profile.video && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Play size={32} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                        {profile.username}
                        <span className="text-sm font-normal text-gray-400">#{profile.id}</span>
                        {profile.video && (
                          <span className="px-2.5 py-1 bg-green-500/20 rounded-full text-xs text-green-300 inline-flex items-center gap-1">
                            <Video size={14} /> видео
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-300 mt-1">
                        {profile.age} лет • {profile.favoriteAnime}
                      </p>
                    </div>

                    <div className="flex gap-3 self-start">
                      <button
                        onClick={() => startEdit(profile)}
                        className="p-3 bg-blue-500/20 rounded-xl text-blue-300 hover:bg-blue-500/30 transition"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="p-3 bg-red-500/20 rounded-xl text-red-300 hover:bg-red-500/30 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 mt-3 line-clamp-3">{profile.bio}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.interests.map((int, i) => (
                      <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                        #{int}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
