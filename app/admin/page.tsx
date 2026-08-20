'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, Plus, PackagePlus, Loader2, Layers, Settings, Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AdminPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form: เพิ่มสินค้า
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Form: เติมสต็อก
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stockItems, setStockItems] = useState('');

  // Form: ตั้งค่าข้อความหน้าเว็บ
  const [badgeText, setBadgeText] = useState('');
  const [title1, setTitle1] = useState('');
  const [title2, setTitle2] = useState('');
  const [heroDesc, setHeroDesc] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: catData } = await supabase.from('categories').select('*');
    if (catData) {
      setCategories(catData);
      if (catData.length > 0) setCategoryId(catData[0].id);
    }

    const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (prodData) {
      setProducts(prodData);
      if (prodData.length > 0) setSelectedProduct(prodData[0].id);
    }

    const { data: setData } = await supabase.from('site_settings').select('*');
    if (setData) {
      setData.forEach((item: any) => {
        if (item.key === 'hero_badge') setBadgeText(item.value);
        if (item.key === 'hero_title_1') setTitle1(item.value);
        if (item.key === 'hero_title_2') setTitle2(item.value);
        if (item.key === 'hero_description') setHeroDesc(item.value);
      });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updates = [
        { key: 'hero_badge', value: badgeText },
        { key: 'hero_title_1', value: title1 },
        { key: 'hero_title_2', value: title2 },
        { key: 'hero_description', value: heroDesc },
      ];

      for (const item of updates) {
        await supabase.from('site_settings').upsert(item);
      }
      toast.success('บันทึกข้อความหน้าเว็บเรียบร้อยแล้ว!');
    } catch (err: any) {
      toast.error(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('กรุณาเลือกรูปภาพสินค้าจากเครื่อง');
      return;
    }

    try {
      setLoading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, imageFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('products').insert({
        name,
        description,
        price: parseFloat(price),
        category_id: categoryId,
        image_url: publicUrl,
        is_active: true,
      });

      if (insertError) throw insertError;

      toast.success('เพิ่มสินค้าและอัปโหลดรูปภาพเรียบร้อย!');
      setName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      fetchInitialData();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItems.trim() || !selectedProduct) {
      toast.error('กรุณากรอกข้อมูลสต็อก');
      return;
    }

    try {
      setLoading(true);
      const lines = stockItems.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
      const payload = lines.map((content) => ({
        product_id: selectedProduct,
        data_content: content,
        is_sold: false,
      }));

      const { error } = await supabase.from('product_items').insert(payload);
      if (error) throw error;

      toast.success(`เติมสต็อกสำเร็จ ${lines.length} ชิ้น!`);
      setStockItems('');
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between">
      <Toaster position="top-right" richColors theme="dark" />
      <div>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
              <Layers className="w-8 h-8 text-sky-400" />
              ระบบจัดการหลังบ้าน (Bytezey Admin)
            </h1>
            <p className="text-xs text-slate-400 mt-2">จัดการข้อความหน้าเว็บ สินค้า และสต็อกได้ในที่เดียว</p>
          </div>

          {/* แผงแก้ไขข้อความหน้าเว็บ */}
          <div className="mb-10 p-6 rounded-2xl bg-[#0e1738] border border-blue-500/20 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-400" />
              แก้ไขข้อความหน้าแรกของร้านค้า
            </h2>
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ป้ายกำกับด้านบน (Badge)</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white focus:border-sky-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ข้อความหัวข้อบรรทัดที่ 1</label>
                <input
                  type="text"
                  value={title1}
                  onChange={(e) => setTitle1(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white focus:border-sky-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ข้อความหัวข้อบรรทัดที่ 2 (ตัวอักษรสีฟ้าเรืองแสง)</label>
                <input
                  type="text"
                  value={title2}
                  onChange={(e) => setTitle2(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white focus:border-sky-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">คำอธิบายร้านค้าย่อ</label>
                <input
                  type="text"
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white focus:border-sky-400 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> บันทึกการแก้ไขข้อความ
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* เพิ่มสินค้าใหม่ */}
            <div className="p-6 rounded-2xl bg-[#0e1738] border border-blue-500/20 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                สร้างสินค้าใหม่
              </h2>
              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ชื่อสินค้า</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Nitro Discord, คีย์บอร์ด, คอร์สเรียน"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:border-sky-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">หมวดหมู่</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white focus:border-sky-400 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0e1738] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ราคา (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:border-sky-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">เลือกรูปภาพสินค้าจากเครื่อง</label>
                  <div className="relative border-2 border-dashed border-blue-500/30 rounded-xl p-4 text-center hover:border-sky-400 transition-colors bg-[#050814]/50">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300">
                      {imageFile ? imageFile.name : 'คลิกเพื่อเลือกไฟล์รูปภาพ'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">คำอธิบาย</label>
                  <textarea
                    rows={2}
                    placeholder="รายละเอียด..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:border-sky-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'บันทึกและอัปโหลดสินค้า'}
                </button>
              </form>
            </div>

            {/* เติมสต็อกสินค้า */}
            <div className="p-6 rounded-2xl bg-[#0e1738] border border-blue-500/20 shadow-xl flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-sky-400" />
                  เติมสต็อกสินค้า
                </h2>
                <form onSubmit={handleAddStock} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">เลือกสินค้า</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white focus:border-sky-400 outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#0e1738] text-white">
                          {p.name} (฿{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      รายการรหัส / ข้อมูลสินค้า (1 บรรทัด = 1 ชิ้น)
                    </label>
                    <textarea
                      rows={8}
                      required
                      placeholder={"KEY-XXXX-1111\nKEY-YYYY-2222\nhttps://drive.google.com/..."}
                      value={stockItems}
                      onChange={(e) => setStockItems(e.target.value)}
                      className="w-full font-mono px-3.5 py-2.5 rounded-xl bg-[#050814] border border-blue-500/30 text-white placeholder-slate-600 focus:border-sky-400 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ยืนยันการเติมสต็อก'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
