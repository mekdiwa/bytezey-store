'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Gamepad2, 
  Wallet, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string>('BYTEZEY');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // ดึงข้อมูล User & Balance
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        if (data) setBalance(data.balance);
      }

      // ดึงโลโก้และชื่อเว็บ
      const { data: settings } = await supabase.from('site_settings').select('*');
      if (settings) {
        settings.forEach((s) => {
          if (s.key === 'site_logo_url') setLogoUrl(s.value);
          if (s.key === 'site_name') setSiteName(s.value);
        });
      }
    };
    fetchData();

    // Realtime Balance
    if (user) {
      const channel = supabase
        .channel(`profile-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        }, (payload: any) => {
          if (payload.new?.balance !== undefined) {
            setBalance(payload.new.balance);
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [supabase, user?.id]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#050814]/80 backdrop-blur-md border-b border-blue-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Site Name */}
          <Link href="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-10 w-10 object-contain rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-transform group-hover:scale-105" 
              />
            ) : (
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-transform group-hover:scale-105">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
            )}
            <span className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]">
              {siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
              หน้าแรก
            </Link>
            <Link href="/topup" className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
              เติมเงิน
            </Link>
            <Link href="/history" className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
              ประวัติการซื้อ
            </Link>
          </div>

          {/* Balance & Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0e1738] border border-blue-500/30 shadow-inner">
                  <Wallet className="w-4 h-4 text-sky-400" />
                  <span className="text-xs text-slate-400">คงเหลือ:</span>
                  <span className="text-sm font-bold text-sky-400">
                    ฿{Number(balance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Link
                  href="/topup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
                >
                  <PlusCircle className="w-4 h-4" />
                  เติมเงิน
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-[#0e1738] border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all transform hover:-translate-y-0.5"
                >
                  เข้าสู่ระบบ / สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-[#0e1738] border border-blue-500/20 text-slate-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-[#0a1026] border-b border-blue-500/20 space-y-3">
          <Link href="/" className="block py-2 text-slate-300 hover:text-sky-400">หน้าแรก</Link>
          <Link href="/topup" className="block py-2 text-slate-300 hover:text-sky-400">เติมเงิน</Link>
          <Link href="/history" className="block py-2 text-slate-300 hover:text-sky-400">ประวัติการซื้อ</Link>
          {user ? (
            <div className="pt-4 border-t border-blue-500/20 flex justify-between items-center">
              <span className="text-sky-400 font-bold">฿{Number(balance).toLocaleString()}</span>
              <button onClick={handleSignOut} className="text-red-400 text-sm">ออกจากระบบ</button>
            </div>
          ) : (
            <div className="pt-4 border-t border-blue-500/20">
              <Link 
                href="/login" 
                className="block text-center py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm"
              >
                เข้าสู่ระบบ / สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
