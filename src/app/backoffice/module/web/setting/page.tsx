'use client';

import React, { useState } from 'react';
import styles from './setting.module.css';
import {
    Settings,
    MapPin,
    Share2,
    Search,
    Save,
    RotateCcw,
    Globe,
    Facebook,
    MessageCircle,
    Youtube
} from 'lucide-react';
import Swal from 'sweetalert2';

type TabType = 'general' | 'contact' | 'social' | 'seo';

export default function SettingPage() {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [settings, setSettings] = useState({
        // General
        siteNameTh: 'สภาเภสัชกรรม',
        siteNameEn: 'The Pharmacy Council',
        slogan: 'เพื่อความปลอดภัยด้านยาและสุขภาพของประชาชน',
        logo: '',
        // Contact
        address: '88/19 หมู่ที่ 4 อาคารสภาวิชาชีพ ชั้น 3 กระทรวงสาธารณสุข ถ.ติวานนท์ ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000',
        phone: '0-2591-9992',
        fax: '0-2591-9991',
        email: 'secretariat@pharmacycouncil.org',
        googleMaps: 'https://goo.gl/maps/example',
        // Social
        facebook: 'https://facebook.com/PharmacyCouncil',
        line: '@PharmacyCouncil',
        youtube: 'https://youtube.com/PharmacyCouncil',
        // SEO
        metaTitle: 'สภาเภสัชกรรม (The Pharmacy Council)',
        metaDescription: 'เว็บไซต์อย่างเป็นทางการของสภาเภสัชกรรม ประเทศไทย ข้อมูลข่าวสาร กฎหมาย และทะเบียนเภสัชกร',
        keywords: 'สภาเภสัชกรรม, เภสัชกร, สอบใบประกอบวิชาชีพ, ทะเบียนเภสัชกร'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 1000));

            Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                text: 'ข้อมูลการตั้งค่าถูกอัปเดตเรียบร้อยแล้ว',
                confirmButtonColor: '#2563eb'
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่ภายหลัง'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className={styles.formGrid}>
                        <h2 className={styles.tabTitle}>ข้อมูลพื้นฐานเว็บไซต์</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>ชื่อเว็บไซต์ (ภาษาไทย)</label>
                            <input
                                type="text"
                                name="siteNameTh"
                                className={styles.input}
                                value={settings.siteNameTh}
                                onChange={handleInputChange}
                                placeholder="ระบุชื่อภาษาไทย..."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>ชื่อเว็บไซต์ (ภาษาอังกฤษ)</label>
                            <input
                                type="text"
                                name="siteNameEn"
                                className={styles.input}
                                value={settings.siteNameEn}
                                onChange={handleInputChange}
                                placeholder="ระบุชื่อภาษาอังกฤษ..."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>สโลแกน (Slogan)</label>
                            <textarea
                                name="slogan"
                                className={styles.textarea}
                                value={settings.slogan}
                                onChange={handleInputChange}
                                placeholder="คำอธิบายสั้นๆ ใต้โลโก้..."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>โลโก้หน่วยงาน</label>
                            <div className={styles.logoUploadArea}>
                                <div className={styles.logoPreview}>
                                    {/* Placeholder icon if no logo */}
                                    <Settings size={40} color="#d1d5db" />
                                </div>
                                <div>
                                    <input type="file" accept="image/*" />
                                    <p className={styles.uploadHint}>แนะนำขนาด 512x512px ไฟล์ PNG หรือ JPG เท่านั้น</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'contact':
                return (
                    <div className={styles.formGrid}>
                        <h2 className={styles.tabTitle}>ข้อมูลติดต่อสำนักงาน</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>ที่อยู่สำนักงาน</label>
                            <textarea
                                name="address"
                                className={styles.textarea}
                                value={settings.address}
                                onChange={handleInputChange}
                                placeholder="เลขที่อาคาร ถนน แขวง เขต..."
                            />
                        </div>

                        <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>เบอร์โทรศัพท์</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className={styles.input}
                                    value={settings.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>เบอร์โทรสาร (Fax)</label>
                                <input
                                    type="text"
                                    name="fax"
                                    className={styles.input}
                                    value={settings.fax}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>อีเมลสภา</label>
                            <input
                                type="email"
                                name="email"
                                className={styles.input}
                                value={settings.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Google Maps URL (Embed)</label>
                            <input
                                type="text"
                                name="googleMaps"
                                className={styles.input}
                                value={settings.googleMaps}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                );

            case 'social':
                return (
                    <div className={styles.formGrid}>
                        <h2 className={styles.tabTitle}>โซเชียลมีเดีย</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><Facebook size={14} style={{ marginRight: '5px' }} /> Facebook Page URL</label>
                            <input
                                type="text"
                                name="facebook"
                                className={styles.input}
                                value={settings.facebook}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><MessageCircle size={14} style={{ marginRight: '5px' }} /> Line Official (ID)</label>
                            <input
                                type="text"
                                name="line"
                                className={styles.input}
                                value={settings.line}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><Youtube size={14} style={{ marginRight: '5px' }} /> YouTube Channel URL</label>
                            <input
                                type="text"
                                name="youtube"
                                className={styles.input}
                                value={settings.youtube}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                );

            case 'seo':
                return (
                    <div className={styles.formGrid}>
                        <h2 className={styles.tabTitle}>SEO & Metadata</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Meta Title</label>
                            <input
                                type="text"
                                name="metaTitle"
                                className={styles.input}
                                value={settings.metaTitle}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Meta Description</label>
                            <textarea
                                name="metaDescription"
                                className={styles.textarea}
                                value={settings.metaDescription}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Keywords (แยกด้วยเครื่องหมายจุลภาค ,)</label>
                            <input
                                type="text"
                                name="keywords"
                                className={styles.input}
                                value={settings.keywords}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>การตั้งค่าส่วนหน้าเว็บ</h1>
                <p className={styles.breadcrumb}>
                    จัดการข้อมูลพื้นฐานและช่องทางการติดต่อที่แสดงบนเว็บไซต์หลัก
                </p>
            </header>

            <div className={styles.settingsCard}>
                {/* Sidebar Tabs */}
                <aside className={styles.tabsSidebar}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'general' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <Settings size={20} />
                        ข้อมูลพื้นฐาน
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'contact' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <MapPin size={20} />
                        ข้อมูลติดต่อ
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'social' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        <Share2 size={20} />
                        โซเชียลมีเดีย
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'seo' ? styles.tabButtonActive : ''}`}
                        onClick={() => setActiveTab('seo')}
                    >
                        <Search size={20} />
                        SEO & Metadata
                    </button>
                </aside>

                {/* Content Area */}
                <div className={styles.tabContent}>
                    {renderTabContent()}

                    <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnSecondary}`}>
                            <RotateCcw size={18} />
                            คืนค่าเริ่มต้น
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            <Save size={18} />
                            {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}