"use client";

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Map as MapIcon, Users, Filter } from 'lucide-react';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input, Select, Button, Badge } from '../../components/common/FormElements';

// Mock Data for Pharmacists
const INITIAL_PHARMACISTS = [
    { id: '1', firstName: 'สมชาย', lastName: 'รักเภสัช', licenseNumber: 'ภ.12345', province: 'กรุงเทพมหานคร', status: 'Active' },
    { id: '2', firstName: 'สมหญิง', lastName: 'ดีงาม', licenseNumber: 'ภ.67890', province: 'เชียงใหม่', status: 'Active' },
    { id: '3', firstName: 'อนันต์', lastName: 'สว่างวงษ์', licenseNumber: 'ภ.11223', province: 'ขอนแก่น', status: 'Inactive' },
    { id: '4', firstName: 'สายใจ', lastName: 'พ่วงพานิช', licenseNumber: 'ภ.44556', province: 'ภูเก็ต', status: 'Active' },
    { id: '5', firstName: 'เกียรติ', lastName: 'ศักดิ์ชัย', licenseNumber: 'ภ.77889', province: 'กรุงเทพมหานคร', status: 'Active' },
];

const PROVINCES = [
    { label: 'กรุงเทพมหานคร', value: 'กรุงเทพมหานคร' },
    { label: 'กระบี่', value: 'กระบี่' },
    { label: 'กาญจนบุรี', value: 'กาญจนบุรี' },
    { label: 'กาฬสินธุ์', value: 'กาฬสินธุ์' },
    { label: 'กำแพงเพชร', value: 'กำแพงเพชร' },
    { label: 'ขอนแก่น', value: 'ขอนแก่น' },
    { label: 'จันทบุรี', value: 'จันทบุรี' },
    { label: 'ฉะเชิงเทรา', value: 'ฉะเชิงเทรา' },
    { label: 'ชลบุรี', value: 'ชลบุรี' },
    { label: 'ชัยนาท', value: 'ชัยนาท' },
    { label: 'ชัยภูมิ', value: 'ชัยภูมิ' },
    { label: 'ชุมพร', value: 'ชุมพร' },
    { label: 'เชียงราย', value: 'เชียงราย' },
    { label: 'เชียงใหม่', value: 'เชียงใหม่' },
    { label: 'ตรัง', value: 'ตรัง' },
    { label: 'ตราด', value: 'ตราด' },
    { label: 'ตาก', value: 'ตาก' },
    { label: 'นครนายก', value: 'นครนายก' },
    { label: 'นครปฐม', value: 'นครปฐม' },
    { label: 'นครพนม', value: 'นครพนม' },
    { label: 'นครราชสีมา', value: 'นครราชสีมา' },
    { label: 'นครศรีธรรมราช', value: 'นครศรีธรรมราช' },
    { label: 'นครสวรรค์', value: 'นครสวรรค์' },
    { label: 'นนทบุรี', value: 'นนทบุรี' },
    { label: 'นราธิวาส', value: 'นราธิวาส' },
    { label: 'น่าน', value: 'น่าน' },
    { label: 'บึงกาฬ', value: 'บึงกาฬ' },
    { label: 'บุรีรัมย์', value: 'บุรีรัมย์' },
    { label: 'ปทุมธานี', value: 'ปทุมธานี' },
    { label: 'ประจวบคีรีขันธ์', value: 'ประจวบคีรีขันธ์' },
    { label: 'ปราจีนบุรี', value: 'ปราจีนบุรี' },
    { label: 'ปัตตานี', value: 'ปัตตานี' },
    { label: 'พระนครศรีอยุธยา', value: 'พระนครศรีอยุธยา' },
    { label: 'พะเยา', value: 'พะเยา' },
    { label: 'พังงา', value: 'พังงา' },
    { label: 'พัทลุง', value: 'พัทลุง' },
    { label: 'พิจิตร', value: 'พิจิตร' },
    { label: 'พิษณุโลก', value: 'พิษณุโลก' },
    { label: 'เพเชี่ยวบุรี', value: 'เพเชี่ยวบุรี' },
    { label: 'เพชรบุรี', value: 'เพชรบุรี' },
    { label: 'เพชรบูรณ์', value: 'เพชรบูรณ์' },
    { label: 'แพร่', value: 'แพร่' },
    { label: 'ภูเก็ต', value: 'ภูเก็ต' },
    { label: 'มหาสารคาม', value: 'มหาสารคาม' },
    { label: 'มุกดาหาร', value: 'มุกดาหาร' },
    { label: 'แม่ฮ่องสอน', value: 'แม่ฮ่องสอน' },
    { label: 'ยโสธร', value: 'ยโสธร' },
    { label: 'ยะลา', value: 'ยะลา' },
    { label: 'ร้อยเอ็ด', value: 'ร้อยเอ็ด' },
    { label: 'ระนอง', value: 'ระนอง' },
    { label: 'ระยอง', value: 'ระยอง' },
    { label: 'ราชบุรี', value: 'ราชบุรี' },
    { label: 'ลพบุรี', value: 'ลพบุรี' },
    { label: 'ลำปาง', value: 'ลำปาง' },
    { label: 'ลำพูน', value: 'ลำพูน' },
    { label: 'เลย', value: 'เลย' },
    { label: 'ศรีสะเกษ', value: 'ศรีสะเกษ' },
    { label: 'สกลนคร', value: 'สกลนคร' },
    { label: 'สงขลา', value: 'สงขลา' },
    { label: 'สตูล', value: 'สตูล' },
    { label: 'สมุทรปราการ', value: 'สมุทรปราการ' },
    { label: 'สมุทรสงคราม', value: 'สมุทรสงคราม' },
    { label: 'สมุทรสาคร', value: 'สมุทรสาคร' },
    { label: 'สระแก้ว', value: 'สระแก้ว' },
    { label: 'สระบุรี', value: 'สระบุรี' },
    { label: 'สิงห์บุรี', value: 'สิงห์บุรี' },
    { label: 'สุโขทัย', value: 'สุโขทัย' },
    { label: 'สุพรรณบุรี', value: 'สุพรรณบุรี' },
    { label: 'สุราษฎร์ธานี', value: 'สุราษฎร์ธานี' },
    { label: 'สุรินทร์', value: 'สุรินทร์' },
    { label: 'หนองคาย', value: 'หนองคาย' },
    { label: 'หนองบัวลำภู', value: 'หนองบัวลำภู' },
    { label: 'อ่างทอง', value: 'อ่างทอง' },
    { label: 'อำนาจเจริญ', value: 'อำนาจเจริญ' },
    { label: 'อุดรธานี', value: 'อุดรธานี' },
    { label: 'อุตรดิตถ์', value: 'อุตรดิตถ์' },
    { label: 'อุทัยธานี', value: 'อุทัยธานี' },
    { label: 'อุบลราชธานี', value: 'อุบลราชธานี' },
];

export default function Register() {
    const [pharmacists, setPharmacists] = useState(INITIAL_PHARMACISTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPharmacist, setEditingPharmacist] = useState<any>(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', licenseNumber: '', province: 'กรุงเทพมหานคร', status: 'Active' });

    // Filtered data based on search and province (if we add province filter from map)
    const filteredPharmacists = useMemo(() => {
        return pharmacists.filter(p =>
            p.firstName.includes(searchTerm) ||
            p.lastName.includes(searchTerm) ||
            p.licenseNumber.includes(searchTerm) ||
            p.province.includes(searchTerm)
        );
    }, [pharmacists, searchTerm]);

    const handleOpenModal = (pharmacist: any = null) => {
        if (pharmacist) {
            setEditingPharmacist(pharmacist);
            setFormData({ ...pharmacist });
        } else {
            setEditingPharmacist(null);
            setFormData({ firstName: '', lastName: '', licenseNumber: '', province: 'กรุงเทพมหานคร', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingPharmacist) {
            setPharmacists(pharmacists.map(p => p.id === editingPharmacist.id ? { ...p, ...formData } : p));
        } else {
            setPharmacists([...pharmacists, { id: Date.now().toString(), ...formData }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('คุณต้องการลบข้อมูลเภสัชกรท่านนี้ใช่หรือไม่?')) {
            setPharmacists(pharmacists.filter(p => p.id !== id));
        }
    };

    // Province counts for the map (computed from current data)
    const provinceCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        pharmacists.forEach(p => {
            counts[p.province] = (counts[p.province] || 0) + 1;
        });
        return counts;
    }, [pharmacists]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">ทะเบียนเภสัชกร</h1>
                    <p className="text-gray-500">จัดการข้อมูลและเรียกดูสถิติจำนวนเภสัชกรทั่วประเทศ</p>
                </div>
                <Button onClick={() => handleOpenModal()} icon={Plus}>
                    เพิ่มทะเบียนเภสัชกร
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Section: Thailand Map */}
                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[500px]">
                    <div className="flex items-center gap-2 mb-4">
                        <MapIcon className="text-blue-600" size={20} />
                        <h2 className="font-semibold text-gray-700">แผนที่แสดงจำนวนเภสัชกร</h2>
                    </div>

                    {/* Placeholder for Interactive Map */}
                    <div className="flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-lg border border-gray-100 shadow-sm text-xs space-y-2 z-10">
                            <h3 className="font-bold text-gray-800 mb-1">สรุปตามตัวอย่าง:</h3>
                            {Object.entries(provinceCounts).map(([prov, count]) => (
                                <div key={prov} className="flex justify-between gap-4">
                                    <span>{prov}</span>
                                    <span className="font-semibold text-blue-600">{count} คน</span>
                                </div>
                            ))}
                        </div>

                        {/* Mock Map Illustration */}
                        <div className="text-center p-8">
                            <div className="w-48 h-64 bg-blue-100 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
                            <MapIcon size={120} className="text-blue-300 mx-auto mb-4 animate-pulse" />
                            <p className="text-gray-400 font-medium">ส่วนแสดงแผนที่ประเทศไทย (Interactive Map)</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">คลิกเลือกจังหวัดในแผนที่เพื่อกรองข้อมูลในตาราง</p>

                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                {PROVINCES.slice(0, 4).map(p => (
                                    <button
                                        key={p.value}
                                        onClick={() => setSearchTerm(p.value)}
                                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs hover:border-blue-500 hover:text-blue-600 transition"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Management Table */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    {/* Search and Filters */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อ, นามสกุล, เลขทะเบียน..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="secondary" icon={Filter}>
                            กรองข้อมูล
                        </Button>
                    </div>

                    {/* Table */}
                    <Table headers={['ชื่อ-นามสกุล', 'เลขทะเบียน', 'จังหวัด', 'สถานะ', 'จัดการ']}>
                        {filteredPharmacists.length > 0 ? (
                            filteredPharmacists.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{p.firstName} {p.lastName}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{p.licenseNumber}</span>
                                    </TableCell>
                                    <TableCell>{p.province}</TableCell>
                                    <TableCell>
                                        <Badge color={p.status === 'Active' ? 'green' : 'gray'}>
                                            {p.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(p)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="แก้ไข"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="ลบ"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="text-center py-12 text-gray-400" colSpan={5}>
                                    ไม่พบข้อมูลที่ค้นหา
                                </TableCell>
                            </TableRow>
                        )}
                    </Table>

                    {/* Stats Card */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">เภสัชกรทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-800">{pharmacists.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <MapIcon size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">จำนวนจังหวัด</p>
                                <p className="text-2xl font-bold text-gray-800">{PROVINCES.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPharmacist ? 'แก้ไขข้อมูลเภสัชกร' : 'เพิ่มข้อมูลเภสัชกร'}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="ชื่อ"
                            placeholder="กรอกชื่อ"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <Input
                            label="นามสกุล"
                            placeholder="กรอกนามสกุล"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>
                    <Input
                        label="เลขทะเบียนเภสัชกร"
                        placeholder="เช่น ภ.12345"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="จังหวัด"
                            options={PROVINCES}
                            value={formData.province}
                            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        />
                        <Select
                            label="สถานะ"
                            options={[
                                { label: 'Active', value: 'Active' },
                                { label: 'Inactive', value: 'Inactive' }
                            ]}
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleSave}>บันทึกข้อมูล</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
