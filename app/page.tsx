'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { Layers, Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    // Fetch Categories
    const { data: catData } = await supabase.from('categories').select('*');
    if (catData) setCategories(catData);

    // Fetch Products with Stock Aggregates
    const { data: prodData } = await supabase
      .from('products')
      .select('*, categories(name), product_items(id, is_sold)')
      .eq('is_active', true);

    if (prodData) {
      const formatted = prodData.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.image_url,
        category: p.categories,
        category_id: p.category_id,
        stockCount: p.product_items.filter((item: any) => !item.is_sold).length,
      }));
      setProducts(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category_id === selectedCategory);

  return (
    <main className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      <Toaster position="top-right" richColors theme="dark" />
      <div>
        <Navbar />
        <HeroBanner />

        {/* Store Inventory Section */}
        <section id="store-inventory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-blue-500/20 pb-6">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-sky-400" />
                คลังสินค้าดิจิทัล
              </h2>
              <p className="text-xs text-slate-400 mt-1">เลือกซื้อสินค้าที่พร้อมจัดส่งทันที</p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                    : 'bg-[#0e1738] text-slate-400 hover:text-white border border-blue-500/20'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                      : 'bg-[#0e1738] text-slate-400 hover:text-white border border-blue-500/20'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#0e1738]/40 rounded-2xl border border-blue-500/10">
              <p className="text-sm text-slate-500">ไม่มีรายการสินค้าในหมวดหมู่นี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPurchaseSuccess={fetchData}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
