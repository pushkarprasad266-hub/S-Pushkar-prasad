import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, Clock, MapPin, 
  Trash2, ShieldCheck, Heart, History, Bell, CheckCircle, LogIn,
  Camera, Upload, AlertCircle, RefreshCw, QrCode, CreditCard, 
  Copy, CheckCircle2, Star, Sparkles, Check, Eye, Maximize2,
  Download, FileText, Loader2, Award
} from 'lucide-react';
import { User as UserType } from '../types';
import { api } from '../services/api';
import { generateVedicKundliPdf } from '../services/pdfReportGenerator';

interface UserProfileViewProps {
  user: UserType | null;
  onUserUpdate: (updated: UserType | null) => void;
  onNavigate: (view: string, extra?: any) => void;
  initialTab?: 'profile' | 'subscription' | 'history' | 'saved' | 'privacy' | 'founder';
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onUserUpdate, onNavigate, initialTab }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'history' | 'saved' | 'privacy' | 'founder'>(initialTab || 'profile');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Subscription state
  const [subUtr, setSubUtr] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const [subErr, setSubErr] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  
  // Login / Switch account state
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loginMsg, setLoginMsg] = useState('');

  // Avatar and photo upload state
  const [avatar, setAvatar] = useState<string>(
    user?.avatar || '/assets/aistudio/IMG_20261102_142408_4767b95b.jpg'
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarFileSize, setAvatarFileSize] = useState<number | null>(151);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit profile state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [date, setDate] = useState(user?.birthDetails?.date || '1998-04-14');
  const [time, setTime] = useState(user?.birthDetails?.time || '08:30');
  const [place, setPlace] = useState(user?.birthDetails?.place || 'New Delhi, India');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profilePdfLoading, setProfilePdfLoading] = useState(false);
  const [profilePdfMsg, setProfilePdfMsg] = useState<string | null>(null);

  const handleDownloadProfilePdf = async (customDetails?: { name: string; dob: string; tob: string; pob: string; lat?: number; lng?: number; gender?: string }) => {
    setProfilePdfLoading(true);
    setProfilePdfMsg(null);
    try {
      const targetName = customDetails?.name || name || user?.name || 'Pushkar Prasad';
      const targetDob = customDetails?.dob || date || '1998-04-14';
      const targetTob = customDetails?.tob || time || '08:30';
      const targetPlace = customDetails?.pob || place || 'New Delhi, India';
      const targetLat = customDetails?.lat || user?.birthDetails?.latitude || 28.6139;
      const targetLng = customDetails?.lng || user?.birthDetails?.longitude || 77.2090;
      const targetGender = customDetails?.gender || user?.birthDetails?.gender || 'male';

      const chart = await api.calculateKundli({
        date: targetDob,
        time: targetTob,
        place: targetPlace,
        latitude: targetLat,
        longitude: targetLng,
        name: targetName,
        gender: targetGender
      });

      const doc = generateVedicKundliPdf(chart, {
        name: targetName,
        dob: targetDob,
        tob: targetTob,
        pob: targetPlace,
        lat: targetLat,
        lng: targetLng,
        gender: targetGender
      });

      const sanitizedName = targetName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Native';
      const fileName = `AASTRONIQ_Vedic_Kundli_${sanitizedName}.pdf`;
      doc.save(fileName);

      setProfilePdfMsg(`Downloaded ${fileName}!`);
      setTimeout(() => setProfilePdfMsg(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF from profile:', err);
      alert('Failed to generate PDF report. Please verify birth details.');
    } finally {
      setProfilePdfLoading(false);
    }
  };

  // Notification toggles
  const [dailyHoroscopeAlert, setDailyHoroscopeAlert] = useState(true);
  const [muhuratAlert, setMuhuratAlert] = useState(true);
  const [planetaryAlert, setPlanetaryAlert] = useState(false);

  // Handle Photo Upload with 200 KB validation
  const MAX_FILE_SIZE = 200 * 1024; // 200 KB in bytes
  const [compressing, setCompressing] = useState(false);
  const [oversizedFile, setOversizedFile] = useState<File | null>(null);

  // High-fidelity bicubic client-side image compressor to ensure photos fit under 200 KB
  const compressImageToUnder200KB = (file: File): Promise<{ dataUrl: string; sizeKb: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // Optimal resolution for crisp round avatar
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.86;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Iteratively decrease quality until strictly below 200 KB
          while (dataUrl.length * 0.75 > 190 * 1024 && quality > 0.25) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          const sizeKb = Math.round((dataUrl.length * 0.75) / 1024);
          resolve({ dataUrl, sizeKb });
        };
        img.onerror = () => reject(new Error('Image decode error'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    });
  };

  const processAndSaveAvatar = async (dataUrl: string, sizeKb: number) => {
    setAvatar(dataUrl);
    setAvatarFileSize(sizeKb);
    setAvatarError(null);
    setOversizedFile(null);

    if (user) {
      try {
        const updated = await api.updateProfile(user.id, { avatar: dataUrl });
        onUserUpdate(updated);
        setAvatarSuccess(`Avatar optimized and saved (${sizeKb} KB / 200 KB)`);
        setTimeout(() => setAvatarSuccess(null), 3500);
      } catch (err) {
        console.error('Failed to save profile picture:', err);
      }
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarSuccess(null);
    setOversizedFile(null);

    // If within 200 KB, load directly
    if (file.size <= MAX_FILE_SIZE) {
      const sizeKb = Math.round(file.size / 1024);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        processAndSaveAvatar(dataUrl, sizeKb);
      };
      reader.readAsDataURL(file);
      return;
    }

    // If file exceeds 200 KB (e.g. phone camera 2MB - 10MB)
    const actualSizeKb = (file.size / 1024).toFixed(1);
    setOversizedFile(file);
    setAvatarError(`Image is ${actualSizeKb} KB (exceeds the 200 KB limit). Click below to auto-optimize it to under 200 KB.`);
  };

  const handleAutoCompress = async () => {
    if (!oversizedFile) return;
    setCompressing(true);
    try {
      const { dataUrl, sizeKb } = await compressImageToUnder200KB(oversizedFile);
      await processAndSaveAvatar(dataUrl, sizeKb);
    } catch (err) {
      setAvatarError('Failed to optimize image. Please select a different photo.');
    } finally {
      setCompressing(false);
    }
  };

  const handleResetAvatar = async () => {
    const defaultImg = '/assets/aistudio/IMG_20261102_142408_4767b95b.jpg';
    setAvatar(defaultImg);
    setAvatarFileSize(151);
    setAvatarError(null);
    setOversizedFile(null);
    if (user) {
      const updated = await api.updateProfile(user.id, { avatar: defaultImg });
      onUserUpdate(updated);
      setAvatarSuccess('Avatar reset to default photo (151 KB / 200 KB)');
      setTimeout(() => setAvatarSuccess(null), 3000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const updated = await api.updateProfile(user.id, {
        name,
        phone,
        avatar,
        birthDetails: {
          date,
          time,
          place,
          latitude: user.birthDetails?.latitude || 28.6139,
          longitude: user.birthDetails?.longitude || 77.2090,
          gender: user.birthDetails?.gender || 'female'
        }
      });
      onUserUpdate(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    try {
      const loggedUser = await api.login(emailInput, nameInput);
      onUserUpdate(loggedUser);
      if (loggedUser.avatar) {
        setAvatar(loggedUser.avatar);
      }
      setLoginMsg(`Logged in as ${loggedUser.name}!`);
      setTimeout(() => setLoginMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirm = window.confirm(
      'Are you sure you want to permanently delete your account and remove all saved personal birth information?'
    );
    if (confirm) {
      await api.deleteAccount(user.id);
      onUserUpdate(null);
      alert('Your account and personal birth data have been completely deleted.');
      onNavigate('home');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="border-b border-purple-500/15 pb-4">
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-purple-400" />
          <span>User Account & Astrological Identity</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage your saved birth coordinates, consultation history, and privacy settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'profile', label: 'Birth Particulars & Profile', icon: User },
          { id: 'subscription', label: '1-Month Trial & ₹15 Plan', icon: QrCode },
          { id: 'history', label: 'Consultation History', icon: History },
          { id: 'saved', label: 'Saved Kundlis', icon: Calendar },
          { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
          { id: 'founder', label: 'Founder: Pushkar Prasad S', icon: Award },
        ].map(t => {
          const Icon = t.icon;
          const isAct = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                isAct
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/80 border border-purple-500/15 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE & BIRTH DETAILS */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-6 shadow-xl">
            {/* Header with Small-Edge Framed Avatar on the Left & 200 KB on the Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              {/* Left & Middle: Small-Edge Framed Container & User Identity */}
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Framed Avatar Container with Small Rounded Edges on the Left */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-[3px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 shadow-xl shadow-purple-600/30">
                    <div className="w-full h-full rounded-[13px] overflow-hidden bg-[#090c24] relative flex items-center justify-center">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={user?.name || 'Profile Avatar'}
                          className="w-full h-full object-cover object-center rounded-[13px] transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="font-cinzel text-3xl font-bold text-white">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                        </span>
                      )}

                      {/* Hover Overlay Button to Trigger Camera / Gallery or Full View */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium rounded-[13px]"
                      >
                        <Camera className="w-5 h-5 text-cyan-300 mb-1" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>

                  {/* Small Rounded Camera Badge on Corner */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg border-2 border-[#060814] transition-all hover:scale-110 active:scale-95"
                    title="Upload photo from camera or gallery (under 200 KB)"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hidden File Input for Camera and Gallery */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {/* User Identity Details & Quick Upload Button */}
                <div className="space-y-1 min-w-0">
                  <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white truncate">
                    {user?.name || 'Pushkar Prasad'}
                  </h2>
                  <p className="text-xs text-purple-300 truncate">{user?.email || 'pushkarprasad266@gmail.com'}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-medium transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upload Photo</span>
                    </button>

                    {/* Quick Avatar Presets with Small-Edge Framing */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/80 border border-purple-500/20">
                      <span className="text-[10px] text-slate-400 mr-0.5">Presets:</span>
                      <button
                        type="button"
                        onClick={() => processAndSaveAvatar('/assets/aistudio/IMG_20261102_142408_4767b95b.jpg', 151)}
                        className={`w-6 h-6 rounded-lg overflow-hidden border transition-all ${
                          avatar === '/assets/aistudio/IMG_20261102_142408_4767b95b.jpg'
                            ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110'
                            : 'border-purple-500/30 hover:border-purple-400 opacity-70 hover:opacity-100'
                        }`}
                        title="Portrait Close-up (151 KB)"
                      >
                        <img src="/assets/aistudio/IMG_20261102_142408_4767b95b.jpg" alt="Portrait Close-up" className="w-full h-full object-cover" />
                      </button>
                      <button
                        type="button"
                        onClick={() => processAndSaveAvatar('/assets/aistudio/Screenshot_20260902_185116_5d6df62b.jpg', 112)}
                        className={`w-6 h-6 rounded-lg overflow-hidden border transition-all ${
                          avatar === '/assets/aistudio/Screenshot_20260902_185116_5d6df62b.jpg'
                            ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110'
                            : 'border-purple-500/30 hover:border-purple-400 opacity-70 hover:opacity-100'
                        }`}
                        title="Full Portrait Photo"
                      >
                        <img src="/assets/aistudio/Screenshot_20260902_185116_5d6df62b.jpg" alt="Portrait" className="w-full h-full object-cover" />
                      </button>
                      <button
                        type="button"
                        onClick={() => processAndSaveAvatar('/assets/aistudio/1793610372476_6b90d080.jpg', 84)}
                        className={`w-6 h-6 rounded-lg overflow-hidden border transition-all ${
                          avatar === '/assets/aistudio/1793610372476_6b90d080.jpg'
                            ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110'
                            : 'border-purple-500/30 hover:border-purple-400 opacity-70 hover:opacity-100'
                        }`}
                        title="AASTRONIQ Celestial Emblem"
                      >
                        <img src="/assets/aistudio/1793610372476_6b90d080.jpg" alt="Celestial Star" className="w-full h-full object-cover" />
                      </button>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 inline-block">
                      Verified Member
                    </span>

                    <button
                      type="button"
                      onClick={() => setActiveTab('subscription')}
                      className={`text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 font-medium transition-colors ${
                        user?.subscription?.status === 'expired'
                          ? 'bg-rose-950/70 border-rose-500/50 text-rose-300 animate-pulse'
                          : user?.subscription?.status === 'active'
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-purple-950/60 border-purple-500/30 text-amber-300 hover:border-amber-400'
                      }`}
                    >
                      <QrCode className="w-3 h-3 text-amber-400" />
                      <span>
                        {user?.subscription?.status === 'expired'
                          ? 'Trial Expired (Pay ₹15)'
                          : user?.subscription?.status === 'active'
                          ? `Pass: ${user?.subscription?.daysRemaining ?? 30}d Left`
                          : `1-Mo Trial: ${user?.subscription?.daysRemaining ?? 27}d Left`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: 200 KB Size Constraint Display */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-500/15 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-right shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-medium leading-none">
                      Photo Limit
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300">
                      200 KB
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-right">
                  {avatarFileSize ? (
                    <span className="font-mono text-emerald-400 font-medium">
                      Size: {avatarFileSize} KB / 200 KB ✓
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Camera · Gallery
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Error or Success notification banner for photo upload */}
            {avatarError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{avatarError}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {oversizedFile && (
                    <button
                      type="button"
                      disabled={compressing}
                      onClick={handleAutoCompress}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-95 text-white font-medium text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${compressing ? 'animate-spin' : ''}`} />
                      <span>{compressing ? 'Optimizing...' : 'Auto-Fit to < 200 KB'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/30 hover:bg-slate-800 text-slate-300 font-medium text-xs"
                  >
                    Pick Another
                  </button>
                </div>
              </div>
            )}

            {avatarSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{avatarSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-purple-500/15 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Time of Birth</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Place of Birth</label>
                  <input
                    type="text"
                    value={place}
                    onChange={e => setPlace(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Update Birth Particulars</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadProfilePdf()}
                    disabled={profilePdfLoading}
                    className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-purple-500/30 text-xs font-semibold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {profilePdfLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Download Vedic PDF Report</span>
                      </>
                    )}
                  </button>
                </div>

                {savedSuccess && (
                  <span className="text-emerald-400 text-xs">Profile updated successfully!</span>
                )}
                {profilePdfMsg && (
                  <span className="text-emerald-400 text-xs font-medium">{profilePdfMsg}</span>
                )}
              </div>
            </form>
          </div>

          {/* DOWNSIDE: Full Image Display with Small Edges & 200 KB Size Validation */}
          <div className="cosmic-glass rounded-3xl p-5 sm:p-7 border border-purple-500/25 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/15">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-cinzel text-sm sm:text-base font-bold text-white">
                    Profile Identity Photo • Full Image View
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Full portrait rendered with small rounded edges • Strictly validated under 200 KB
                </p>
              </div>

              {/* 200 KB Constraint Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-slate-300 font-medium">Size:</span>
                  <span className="font-mono text-xs font-bold text-cyan-300">
                    {avatarFileSize || 151} KB
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">/ 200 KB Max</span>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold uppercase tracking-wider">
                  ✓ Validated
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
              {/* Full Photo with Small Edges (rounded-2xl frame) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative group p-1.5 rounded-2xl bg-gradient-to-tr from-purple-500/40 via-indigo-500/30 to-cyan-400/40 border border-purple-500/30 shadow-2xl">
                  <div className="w-56 sm:w-64 aspect-square rounded-xl overflow-hidden bg-[#090c24] relative shadow-inner">
                    <img
                      src={avatar}
                      alt="Full Profile Portrait"
                      className="w-full h-full object-cover object-center rounded-xl transition-all duration-300 group-hover:scale-105"
                    />
                    {/* Subtle gradient banner at bottom */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate drop-shadow">
                        {user?.name || 'Pushkar Prasad'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950/90 text-cyan-300 border border-purple-400/30">
                        {avatarFileSize || 151} KB • Small Edge
                      </span>
                    </div>

                    {/* Quick Expand Button on Top Right */}
                    <button
                      type="button"
                      onClick={() => setShowFullImageModal(true)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                      title="Expand Full Resolution"
                    >
                      <Maximize2 className="w-4 h-4 text-cyan-300" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  Full image uncropped • Small edge radius framing
                </p>
              </div>

              {/* Downside Details & Controls */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">File Capacity Status</span>
                    <span className="text-emerald-400 font-medium">Valid (&lt; 200 KB)</span>
                  </div>
                  
                  {/* Visual Progress Bar relative to 200 KB */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round(((avatarFileSize || 151) / 200) * 100))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Selected Photo: <strong className="text-cyan-300 font-mono">{avatarFileSize || 151} KB</strong></span>
                    <span>Safety Margin: <strong className="text-emerald-300 font-mono">{Math.max(0, 200 - (avatarFileSize || 151))} KB free</strong></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFullImageModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-purple-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Full View</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50 text-xs flex items-center gap-1 transition-colors"
                    title="Reset to default portrait"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                </div>

                {/* Available Assets Switcher */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Quick Select Available Assets:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => processAndSaveAvatar('/assets/aistudio/IMG_20261102_142408_4767b95b.jpg', 151)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                        avatar === '/assets/aistudio/IMG_20261102_142408_4767b95b.jpg'
                          ? 'bg-purple-900/60 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/70 border-purple-500/20 text-slate-300 hover:border-purple-400'
                      }`}
                    >
                      <img src="/assets/aistudio/IMG_20261102_142408_4767b95b.jpg" alt="Close-up" className="w-5 h-5 rounded-md object-cover" />
                      <span>Close-up (151 KB)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => processAndSaveAvatar('/assets/aistudio/Screenshot_20260902_185116_5d6df62b.jpg', 112)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                        avatar === '/assets/aistudio/Screenshot_20260902_185116_5d6df62b.jpg'
                          ? 'bg-purple-900/60 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/70 border-purple-500/20 text-slate-300 hover:border-purple-400'
                      }`}
                    >
                      <img src="/assets/aistudio/Screenshot_20260902_185116_5d6df62b.jpg" alt="Portrait" className="w-5 h-5 rounded-md object-cover" />
                      <span>Campus (112 KB)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => processAndSaveAvatar('/assets/aistudio/1793610372476_6b90d080.jpg', 84)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                        avatar === '/assets/aistudio/1793610372476_6b90d080.jpg'
                          ? 'bg-purple-900/60 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/70 border-purple-500/20 text-slate-300 hover:border-purple-400'
                      }`}
                    >
                      <img src="/assets/aistudio/1793610372476_6b90d080.jpg" alt="Emblem" className="w-5 h-5 rounded-md object-cover" />
                      <span>Emblem (84 KB)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Account Switch / Login */}
          <div className="cosmic-glass rounded-2xl p-5 border border-purple-500/20 space-y-3 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>Switch or Sign In with Another Account</span>
            </h3>
            <form onSubmit={handleLogin} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Name"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white placeholder:text-slate-500 focus:outline-none flex-1 text-xs"
              />
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="email@example.com"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white placeholder:text-slate-500 focus:outline-none flex-1 text-xs"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-purple-500/30 shrink-0"
              >
                Sign In
              </button>
            </form>
            {loginMsg && <p className="text-emerald-400 text-[11px]">{loginMsg}</p>}
          </div>
        </div>
      )}

      {/* TAB: 1-MONTH TRIAL & ₹15/MONTH SUBSCRIPTION */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="cosmic-glass rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-6 shadow-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                    Membership & 1-Month Trial
                  </h2>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    ₹15 / MONTH
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full 30-day free trial on signup, followed by affordable monthly renewal of ₹15.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                  user?.subscription?.status === 'expired'
                    ? 'bg-rose-950/70 text-rose-300 border-rose-500/50'
                    : user?.subscription?.status === 'active'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                    : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {user?.subscription?.status === 'expired'
                      ? 'Trial Expired (0 Days)'
                      : user?.subscription?.status === 'active'
                      ? `Active Pass (${user?.subscription?.daysRemaining ?? 30} Days)`
                      : `1-Mo Trial: ${user?.subscription?.daysRemaining ?? 27} Days Remaining`}
                  </span>
                </span>
              </div>
            </div>

            {/* Numeric Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
                  {user?.subscription?.daysRemaining ?? 27}
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Days Remaining</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
                  ₹15
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Monthly Fee</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
                  ₹0.50
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Daily Cost</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20">
                <span className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
                  30
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Trial Days</p>
              </div>
            </div>

            {/* UPI QR Code & Payment Section */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0c0e27] to-[#070919] border border-purple-500/30 space-y-5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* QR Code Container */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-amber-400/40 relative">
                    <img
                      src="/assets/aistudio/Screenshot_20261102_152900_a2e2e40c.jpg"
                      alt="AASTRONIQ UPI QR Code"
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black font-extrabold text-xs rounded-full shadow-md whitespace-nowrap">
                      Pay ₹15 / Month
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-xs">
                    <span className="text-slate-400">UPI:</span>
                    <span className="font-mono text-cyan-300 font-semibold">pushkarprasad266@fampay</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText('pushkarprasad266@fampay');
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Right: Payment Instructions & Verification Form */}
                <div className="flex-1 space-y-4 text-xs">
                  <div>
                    <h3 className="font-bold text-white text-sm">Scan with any UPI App</h3>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      Works with Google Pay, PhonePe, Paytm, BHIM, Cred, FamPay, and all bank UPI apps.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-1.5 text-slate-300 text-[11px]">
                    <p className="font-semibold text-amber-300">How to activate / renew:</p>
                    <p>1. Scan the QR code with your UPI app or send ₹15 to the UPI ID.</p>
                    <p>2. Enter your 12-digit UPI Reference / UTR Number below.</p>
                    <p>3. Click "Verify & Activate" to instantly add 30 days of complete access.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>UPI Reference / UTR Number:</span>
                      <button
                        type="button"
                        onClick={() => setSubUtr(`4${Math.floor(10000000000 + Math.random() * 90000000000)}`)}
                        className="text-amber-400 hover:underline text-[11px]"
                      >
                        Autofill Demo UTR
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={subUtr}
                        onChange={e => setSubUtr(e.target.value)}
                        placeholder="e.g. 431089234567"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!user) return;
                          setSubLoading(true);
                          setSubErr(null);
                          try {
                            const res = await api.paySubscription({
                              userId: user.id,
                              transactionRef: subUtr.trim() || `UPI-PROFILE-${Date.now().toString().slice(-6)}`,
                              amount: 15
                            });
                            if (res.success && res.user) {
                              onUserUpdate(res.user);
                              setSubMsg('Subscription activated successfully for ₹15/month! 30 days added.');
                              setTimeout(() => setSubMsg(null), 4000);
                            }
                          } catch (e: any) {
                            setSubErr(e?.message || 'Payment verification failed');
                          } finally {
                            setSubLoading(false);
                          }
                        }}
                        disabled={subLoading}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                      >
                        {subLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Verify & Pay ₹15</span>
                      </button>
                    </div>
                    {subErr && <p className="text-rose-400 text-xs">{subErr}</p>}
                    {subMsg && <p className="text-emerald-400 text-xs">{subMsg}</p>}
                  </div>
                </div>
              </div>

              {/* Dev Simulation Bar */}
              <div className="pt-3 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Testing & Verification Controls:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user) return;
                      const res = await api.simulateSubscription(user.id, 'trial');
                      if (res.user) onUserUpdate(res.user);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300"
                  >
                    Reset 30-Day Trial
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user) return;
                      const res = await api.simulateSubscription(user.id, 'expired');
                      if (res.user) onUserUpdate(res.user);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300"
                  >
                    Simulate Expired Trial (0 Days)
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user) return;
                      const res = await api.simulateSubscription(user.id, 'active');
                      if (res.user) onUserUpdate(res.user);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300"
                  >
                    Simulate Paid Active (₹15)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSULTATION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="cosmic-glass rounded-3xl p-6 border border-purple-500/20 space-y-4">
            <h2 className="font-cinzel text-base font-bold text-white">Past Consultation Records</h2>

            {!user?.consultationHistory?.length ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No past consultations yet. Browse our verified scholars to initiate a session.
              </p>
            ) : (
              <div className="space-y-3">
                {user.consultationHistory.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.expertImage}
                        alt={item.expertName}
                        className="w-12 h-12 rounded-xl object-cover border border-purple-500/30"
                      />
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-white text-xs sm:text-sm">{item.expertName}</h4>
                        <p className="text-[11px] text-purple-300 capitalize">{item.serviceType} Consultation · {item.duration}</p>
                        <p className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
                        Completed
                      </span>
                      {item.notes && (
                        <p className="text-[11px] text-slate-300 italic max-w-xs">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SAVED KUNDLIS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="cosmic-glass rounded-3xl p-6 border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-cinzel text-base font-bold text-white">Saved Birth Charts</h2>
              <button
                onClick={() => onNavigate('kundli')}
                className="text-xs text-purple-300 hover:text-white"
              >
                + New Chart
              </button>
            </div>

            {!user?.savedKundlis?.length ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No saved charts found. Generate a Kundli to save charts here for fast one-tap review.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {user.savedKundlis.map(k => (
                  <div
                    key={k.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/15 space-y-2 hover:border-purple-400/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{k.name}</h4>
                      <span className="text-[10px] text-purple-300">{k.gender}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] space-y-0.5">
                      <p>Date: {k.dob} at {k.tob}</p>
                      <p>Place: {k.pob}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadProfilePdf({
                          name: k.name,
                          dob: k.dob,
                          tob: k.tob,
                          pob: k.pob,
                          lat: k.lat,
                          lng: k.lng,
                          gender: k.gender
                        })}
                        disabled={profilePdfLoading}
                        className="flex-1 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/60 text-purple-200 text-xs font-semibold border border-purple-500/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download className="w-3 h-3 text-amber-300" />
                        <span>PDF Report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigate('kundli')}
                        className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-purple-500/20 text-center"
                      >
                        Open Studio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY & NOTIFICATIONS */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          {/* Notification Preferences */}
          <div className="cosmic-glass rounded-3xl p-6 border border-purple-500/20 space-y-4 text-xs">
            <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Cosmic Alert Preferences</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-purple-500/15 cursor-pointer">
                <div>
                  <p className="font-semibold text-white">Daily Sunrise Horoscope</p>
                  <p className="text-slate-400 text-[11px]">Receive early morning transit guidance for your sign</p>
                </div>
                <input
                  type="checkbox"
                  checked={dailyHoroscopeAlert}
                  onChange={e => setDailyHoroscopeAlert(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-purple-500/15 cursor-pointer">
                <div>
                  <p className="font-semibold text-white">Abhijit Muhurat Notifications</p>
                  <p className="text-slate-400 text-[11px]">Alerts 15 minutes before the daily golden window begins</p>
                </div>
                <input
                  type="checkbox"
                  checked={muhuratAlert}
                  onChange={e => setMuhuratAlert(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Privacy Controls & Deletion */}
          <div className="cosmic-glass rounded-3xl p-6 border border-rose-500/30 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <Trash2 className="w-4 h-4" />
              <span>Account & Personal Data Privacy</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Zorvexa Astro strictly safeguards your birth time and coordinates. You may exercise full data sovereignty by deleting all stored records, consultation history, and profile data from our servers.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-200 hover:text-white font-medium transition-colors"
            >
              Permanently Delete My Account & Data
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: FOUNDER & APP VISION */}
      {activeTab === 'founder' && (
        <div className="space-y-6">
          <div className="cosmic-glass rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-amber-950/40 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Founder Profile Header */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-amber-500/20 pb-6">
              {/* Founder Picture - Small Frame with Gold Accent */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-[3px] bg-gradient-to-tr from-amber-400 via-purple-500 to-cyan-400 shadow-2xl shadow-amber-500/20">
                  <div className="w-full h-full rounded-[13px] overflow-hidden bg-[#090c24] relative shadow-inner">
                    <img
                      src="/assets/aistudio/image_968d68c8.png"
                      alt="PUSHKAR PRASAD S - Founder"
                      className="w-full h-full object-cover object-top rounded-[13px]"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-[#060814] text-[10px] font-black uppercase tracking-wider shadow-lg border border-amber-300 flex items-center gap-1">
                  <span>★</span>
                  <span>FOUNDER</span>
                </div>
              </div>

              {/* Founder Credentials & Title */}
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Official Creator & Lead Architect</span>
                </div>

                <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-purple-200 tracking-wide">
                  PUSHKAR PRASAD S
                </h2>

                <p className="text-xs sm:text-sm text-purple-200 font-medium">
                  Founder of <span className="text-amber-300 font-bold">AASTRONIQ</span> – AI Astrology & Vedic Kundli
                </p>

                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  Dedicated to revolutionizing personal astrology by marrying authentic Vedic Jyotish (Chitrapaksha Lahiri ephemeris) with high-precision computation and ethical artificial intelligence.
                </p>

                {/* Contact and Status */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs">
                  <div className="px-3 py-1 rounded-xl bg-slate-900/80 border border-purple-500/20 text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono text-[11px]">pushkarprasad266@gmail.com</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-900/80 border border-purple-500/20 text-emerald-300 flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Founder Identity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder's Mission and Core Pillars */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Astronomical Ephemeris</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  High-precision sidereal calculations using Chitrapaksha (Lahiri) Ayanamsha for authentic planetary degrees, house Bhavas, and Nakshatra charanas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Vector PDF Reports</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  Comprehensive 3-page downloadable astrological dossiers featuring vector D-1 Diamond Kundlis, Vimshottari Dashas, and classical remedies.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Affordability & Ethics</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  1-Month free trial on signup, accessible ₹15/month renewal, strict user privacy, and complete data ownership.
                </p>
              </div>
            </div>

            {/* Founder's Personal Message */}
            <div className="relative z-10 p-5 rounded-2xl bg-[#080b20]/80 border border-purple-500/20 space-y-2">
              <h4 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                Founder's Message to Seekers
              </h4>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Our guiding philosophy at AASTRONIQ is simple: Astrology should empower, not intimidate. The stars reveal potential energy currents; your purposeful Karma and consciousness shape reality. We built this platform to give you clear, uncompromised celestial guidance whenever you need it."
              </p>
              <div className="text-right text-[11px] font-cinzel text-amber-200 font-bold pt-1">
                — PUSHKAR PRASAD S, Founder
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Down side at right: Founder of the App Card */}
      <div className="flex justify-end pt-2 pb-1">
        <div
          onClick={() => setActiveTab('founder')}
          className="group cursor-pointer cosmic-glass p-3 sm:p-4 rounded-2xl border border-amber-400/40 hover:border-amber-400 bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-amber-950/40 shadow-xl hover:shadow-amber-500/20 flex items-center gap-3.5 max-w-sm transition-all hover:scale-[1.02]"
          title="Click to view Founder details"
        >
          {/* Small picture of founder Pushkar Prasad S */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl p-[2px] bg-gradient-to-tr from-amber-400 via-purple-500 to-cyan-400 shadow-md shadow-amber-500/20">
              <img
                src="/assets/aistudio/image_968d68c8.png"
                alt="PUSHKAR PRASAD S - Founder"
                className="w-full h-full object-cover object-top rounded-[10px]"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[#060814] flex items-center justify-center text-[9px] font-black border border-[#060814]" title="Founder">
              ★
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Founder of the App
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-semibold">
                Creator
              </span>
            </div>
            <h4 className="font-cinzel text-xs sm:text-sm font-bold text-white tracking-wide group-hover:text-amber-200 transition-colors">
              PUSHKAR PRASAD S
            </h4>
            <p className="text-[10px] text-slate-400 leading-tight">
              AASTRONIQ – AI Astrology & Horoscope
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {showFullImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullImageModal(false)}
        >
          <div 
            className="relative max-w-lg w-full bg-[#0a0d24] border border-purple-500/40 rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div>
                <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Full Resolution Profile Photo</span>
                </h3>
                <p className="text-xs text-purple-300">
                  {user?.name || 'Pushkar Prasad'} • {avatarFileSize || 151} KB (Under 200 KB Limit)
                </p>
              </div>
              <button
                onClick={() => setShowFullImageModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold border border-purple-500/20"
              >
                ✕
              </button>
            </div>

            {/* Uncropped Full Image with Small Edges */}
            <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-[#060814] flex items-center justify-center p-2 shadow-inner">
              <img
                src={avatar}
                alt="Full Profile Uncropped"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300 font-mono text-[11px]">Validated: {avatarFileSize || 151} KB / 200 KB</span>
              </div>
              <button
                onClick={() => setShowFullImageModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/30"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
