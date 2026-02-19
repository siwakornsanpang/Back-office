"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // 🔥 เอาไว้ดึง [category]
import { Edit, Trash2, Plus, Image as ImageIcon, Link as LinkIcon, Save, UploadCloud, X } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "./agency.module.css"; // Reuse CSS ของ Council ได้เลย หรือสร้างใหม่

const MySwal = withReactContent(Swal);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Mapping ชื่อหมวดหมู่จาก URL -> Database Value -> ชื่อภาษาไทย
const CATEGORY_MAP: Record<string, { dbValue: string; title: string }> = {
  "pharmacy": { dbValue: "secretary", title: "สำนักงานเลขาธิการสภาเภสัชกรรม" },
  "royal-college": { dbValue: "royal_college", title: "ราชวิทยาลัยสภาเภสัชกรรมแห่งประเทศไทย" },
  "supervised-organization": { dbValue: "supervised", title: "องค์กรในกำกับ" },
};

export default function AgencyDynamicPage() {
  const params = useParams(); 
  const categoryParam = params?.category as string; // เช่น 'royal-college'
  
  // แปลง URL param เป็น config ที่เราตั้งไว้
  const currentConfig = CATEGORY_MAP[categoryParam] || { dbValue: categoryParam, title: "จัดการหน่วยงาน" };

  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    order: 1,
    file: null as File | null,
    preview: null as string | null,
  });

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // ส่ง query ?category=xxxx ไปกรองที่ API
      const res = await fetch(`${API_URL}/agencies?category=${currentConfig.dbValue}`);
      const data = await res.json();
      setAgencies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (categoryParam) fetchData();
  }, [categoryParam]);

  // Open Modal
  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        description: item.description || "",
        url: item.url,
        order: item.order,
        file: null,
        preview: item.imageUrl,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        url: "",
        order: agencies.length + 1,
        file: null,
        preview: null,
      });
    }
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    MySwal.fire({ title: 'บันทึกข้อมูล...', didOpen: () => Swal.showLoading() });

    const form = new FormData();
    form.append("category", currentConfig.dbValue); // 🔥 Auto set category
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("url", formData.url);
    form.append("order", formData.order.toString());
    if (formData.file) form.append("file", formData.file);

    try {
        const url = editingId ? `${API_URL}/agencies/${editingId}` : `${API_URL}/agencies`;
        const method = editingId ? "PUT" : "POST";
        
        const res = await fetch(url, { method, body: form });
        if(!res.ok) throw new Error();

        await MySwal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย', 'success');
        setIsModalOpen(false);
        fetchData();
    } catch (error) {
        MySwal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
     // ... (Logic ลบเหมือนหน้าอื่น) ...
      const res = await MySwal.fire({
          title: 'ยืนยันการลบ?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ลบ',
          confirmButtonColor: '#ef4444'
      });
      if(res.isConfirmed) {
          await fetch(`${API_URL}/agencies/${id}`, { method: 'DELETE' });
          fetchData();
          MySwal.fire('ลบสำเร็จ', '', 'success');
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {/* Header Dynamic */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{currentConfig.title}</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการข้อมูลหน่วยงานในหมวดหมู่นี้</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={20} /> เพิ่มหน่วยงาน
        </button>
      </div>

      {/* Grid Display (Card Style ตาม Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Logo Area */}
            <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100 relative group">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-24 object-contain" />
                ) : (
                    <ImageIcon size={48} className="text-gray-300" />
                )}
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center gap-2 transition-all">
                     <button onClick={() => openModal(item)} className="bg-white p-2 rounded-full hover:bg-gray-100 text-blue-600"><Edit size={18}/></button>
                     <button onClick={() => handleDelete(item.id)} className="bg-white p-2 rounded-full hover:bg-gray-100 text-red-600"><Trash2 size={18}/></button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-2">{item.name}</h3>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full whitespace-nowrap">#{item.order}</span>
                </div>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                    {item.description || "ไม่มีรายละเอียด"}
                </p>

                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm flex items-center gap-1 hover:underline mt-auto pt-4 border-t border-gray-100">
                    <LinkIcon size={14} /> {item.url}
                </a>
            </div>
          </div>
        ))}
      </div>
      
      {agencies.length === 0 && !isLoading && (
        <div className="text-center py-20 text-gray-400">ยังไม่มีข้อมูลในหมวดหมู่นี้</div>
      )}


      {/* --- Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="font-bold text-lg">{editingId ? 'แก้ไขข้อมูล' : 'เพิ่มหน่วยงานใหม่'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Image Upload */}
                <div className="flex justify-center mb-4">
                    <label className="relative cursor-pointer group">
                        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:border-blue-500 transition">
                            {formData.preview ? (
                                <img src={formData.preview} className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <UploadCloud className="mx-auto mb-1" />
                                    <span className="text-xs">Upload Logo</span>
                                </div>
                            )}
                        </div>
                        <input type="file" hidden accept="image/*" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if(f) setFormData({...formData, file: f, preview: URL.createObjectURL(f)});
                        }} />
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหน่วยงาน</label>
                    <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                           value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายสั้นๆ (แสดงในการ์ด)</label>
                    <textarea rows={3} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                           value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website URL (Redirect)</label>
                        <input required type="url" placeholder="https://..." className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ลำดับ</label>
                        <input type="number" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} />
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">ยกเลิก</button>
                    <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">บันทึก</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}