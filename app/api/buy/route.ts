import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'ระบุรหัสสินค้าไม่ถูกต้อง' }, { status: 400 });
    }

    // Call Atomic RPC Function ใน Database
    const { data, error } = await supabase.rpc('purchase_product', {
      p_product_id: productId,
      p_user_id: user.id
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.success) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      data: {
        orderId: data.order_id,
        productName: data.product_name,
        deliveredData: data.delivered_data
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
