"use client";

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Map as MapIcon, Users, Filter } from 'lucide-react';
import { Table, TableRow, TableCell } from '../../../components/common/Table';
import { Modal } from '../../../components/common/Modal';
import { Input, Select, Button, Badge } from '../../../components/common/FormElements';
import styles from './Register.module.css';

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
    const [filterProvince, setFilterProvince] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPharmacist, setEditingPharmacist] = useState<any>(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', licenseNumber: '', province: 'กรุงเทพมหานคร', status: 'Active' });
    const [sortBy, setSortBy] = useState<'name' | 'license' | 'date'>('name');

    // Get unique provinces from current data
    const uniqueProvinces = useMemo(() => {
        const provinces = [...new Set(pharmacists.map(p => p.province))];
        return provinces.sort();
    }, [pharmacists]);

    // Filtered data based on search and province filter
    const filteredPharmacists = useMemo(() => {
        return pharmacists
            .filter(p => {
                const matchesSearch = 
                    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
                
                const matchesProvince = filterProvince === '' || p.province === filterProvince;
                const matchesStatus = filterStatus === '' || p.status === filterStatus;
                
                return matchesSearch && matchesProvince && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'name') {
                    return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
                } else if (sortBy === 'license') {
                    return a.licenseNumber.localeCompare(b.licenseNumber);
                }
                return 0;
            });
    }, [pharmacists, searchTerm, filterProvince, filterStatus, sortBy]);

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
        // Validation
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.licenseNumber.trim()) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (editingPharmacist) {
            setPharmacists(pharmacists.map(p => p.id === editingPharmacist.id ? { ...p, ...formData } : p));
        } else {
            setPharmacists([...pharmacists, { id: Date.now().toString(), ...formData }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`คุณต้องการลบข้อมูลเภสัชกร ${name} ใช่หรือไม่?`)) {
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">ทะเบียนเภสัชกร</h1>
                <p className="text-gray-600 mt-1">จัดการข้อมูลเภสัชกรและสถานะทะเบียน</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">เภสัชกรทั้งหมด</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{pharmacists.length}</p>
                        </div>
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <Users size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">กำลังใช้งาน</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">
                                {pharmacists.filter(p => p.status === 'Active').length}
                            </p>
                        </div>
                        <div className="p-2.5 bg-green-50 rounded-lg">
                            <Filter size={20} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">พื้นที่ปฏิบัติงาน</p>
                            <p className="text-3xl font-bold text-purple-600 mt-1">{uniqueProvinces.length}</p>
                        </div>
                        <div className="p-2.5 bg-purple-50 rounded-lg">
                            <MapIcon size={20} className="text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Filters Section */}
                <div className="border-b border-gray-200 p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900">ตัวกรองและค้นหา</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อ, นามสกุล, เลขทะเบียน..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter by Province */}
                        <select
                            value={filterProvince}
                            onChange={(e) => setFilterProvince(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        >
                            <option value="">ทั้งหมด - จังหวัด</option>
                            {PROVINCES.map(province => (
                                <option key={province.value} value={province.value}>{province.label}</option>
                            ))}
                        </select>

                        {/* Filter by Status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        >
                            <option value="">ทั้งหมด - สถานะ</option>
                            <option value="Active">กำลังใช้งาน</option>
                            <option value="Inactive">ไม่ใช้งาน</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'license' | 'date')}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        >
                            <option value="name">เรียงตามชื่อ</option>
                            <option value="license">เรียงตามเลขทะเบียน</option>
                        </select>
                    </div>

                    {/* Active Filters */}
                    {(searchTerm || filterProvince || filterStatus) && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {searchTerm && (
                                <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    ค้นหา: {searchTerm}
                                    <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">✕</button>
                                </span>
                            )}
                            {filterProvince && (
                                <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    {filterProvince}
                                    <button onClick={() => setFilterProvince('')} className="hover:text-blue-900">✕</button>
                                </span>
                            )}
                            {filterStatus && (
                                <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    {filterStatus === 'Active' ? 'กำลังใช้งาน' : 'ไม่ใช้งาน'}
                                    <button onClick={() => setFilterStatus('')} className="hover:text-blue-900">✕</button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">เลขทะเบียน</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">จังหวัด</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">สถานะ</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPharmacists.length > 0 ? (
                                filteredPharmacists.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                                                {p.licenseNumber}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{p.province}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                p.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {p.status === 'Active' ? '✓ กำลังใช้งาน' : '○ ไม่ใช้งาน'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="แก้ไข"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id, `${p.firstName} ${p.lastName}`)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="ลบ"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <MapIcon size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">ไม่พบข้อมูล</p>
                                        <p className="text-gray-400 text-sm mt-1">ลองปรับตัวกรองหรือค้นหาใหม่อีกครั้ง</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Info */}
                {filteredPharmacists.length > 0 && (
                    <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 text-sm text-gray-600">
                        แสดง <span className="font-semibold text-gray-900">{filteredPharmacists.length}</span> จาก <span className="font-semibold text-gray-900">{pharmacists.length}</span> รายการ
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPharmacist ? 'แก้ไขข้อมูลเภสัชกร' : 'เพิ่มเภสัชกรใหม่'}
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="ชื่อ *"
                            placeholder="กรอกชื่อจริง"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <Input
                            label="นามสกุล *"
                            placeholder="กรอกนามสกุล"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>

                    <Input
                        label="เลขทะเบียนเภสัชกร *"
                        placeholder="เช่น ภ.12345"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="จังหวัด"
                            options={PROVINCES}
                            value={formData.province}
                            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        />
                        <Select
                            label="สถานะ"
                            options={[
                                { label: 'กำลังใช้งาน', value: 'Active' },
                                { label: 'ไม่ใช้งาน', value: 'Inactive' }
                            ]}
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsModalOpen(false)}
                        >
                            ยกเลิก
                        </Button>
                        <Button onClick={handleSave}>
                            {editingPharmacist ? 'อัปเดต' : 'เพิ่ม'}เภสัชกร
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
