import React from 'react';
import Link from 'next/link';
import { Gamepad2, Heart, MessageSquare, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050814] border-t border-blue-500/20 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-wider">BYTEZEY</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              แพลตฟอร์มจำหน่ายโค้ดและไอดีเกมดิจิทัลแบบอัตโนมัติ สะดวก รวดเร็ว การันตีความปลอดภัยและพร้อมซัพพอร์ตลูกค้าตลอด 24 ชั่วโมง
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">บริการของเรา</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-sky-400 transition-colors">
                  สินค้าทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/topup" className="hover:text-sky-400 transition-colors">
                  เติมเงินอั่งเปา
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-sky-400 transition-colors">
                  ประวัติคำสั่งซื้อ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">ช่องทางติดต่อ</h4>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="p-3 rounded-xl bg-[#0e1738] border border-blue-500/20 text-slate-300 hover:text-sky-400 hover:border-sky-400/40 transition-all shadow-inner"
                title="Discord Community"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-3 rounded-xl bg-[#0e1738] border border-blue-500/20 text-slate-300 hover:text-sky-400 hover:border-sky-400/40 transition-all shadow-inner"
                title="Trust & Security"
              >
                <ShieldCheck className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-500/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Bytezey Store. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Gamers
          </p>
        </div>
      </div>
    </footer>
  );
}
