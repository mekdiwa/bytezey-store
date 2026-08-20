'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, Mail, User, Loader2, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // เข้าสู่ระบบ
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('เข้าสู่ระบบสำเร็จ!');
        router.push('/');
        router.refresh();
      } else {
        // สมัครสมาชิก
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] },
          },
        });
        if (error) throw error;
        toast.success('สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...');
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการทำรายการ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between">
      <Toaster position="top-right" richColors theme="dark" />
      <div>
        <Navbar />

        <div className="max-w-md mx-auto px-4 py-20">
          <div className="p-8 rounded-2xl bg-[#0e1738] border border-blue-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white">
                {isLogin ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีใหม่'}
              </h1>
              <p className="text-xs text-slate-400 mt-2">
                {isLogin ? 'เข้าสู่ระบบเพื่อจัดการไอเทมและยอดเงินของคุณ' : 'สมัครสมาชิกเพื่อเริ่มต้นการสั่งซื้ออัตโนมัติ'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 text-xs">
              {!isLogin && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ชื่อผู้ใช้</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="เช่น GamerPro99"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">อีเมล</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'เข้าสู่ระบบ' : 'ยืนยันการสมัคร'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-blue-500/20 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
              >
                {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
              </button>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
