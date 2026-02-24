'use client';

import React, { useState } from 'react';
import styles from './setting.module.css';
import {
    Settings,
    MapPin,
    Share2,
    Save,
} from 'lucide-react';
import Swal from 'sweetalert2';

type TabType = 'general' | 'contact' | 'social';

export default function SettingPage() {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [settings, setSettings] = useState({
        // General
        siteNameTh: 'สภาเภสัชกรรม',
        siteNameEn: 'The Pharmacy Council of Thailand',
        slogan: 'เพื่อความปลอดภัยด้านยาและสุขภาพของประชาชน',
        logo: '',
        // Contact
        address: 'สำนักงานเลขาธิการสภาเภสัชกรรม อาคารมหิตลาธิเบศร ชั้น 8 กระทรวงสาธารณสุข เลขที่ 88/19 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000',
        phone: '0-2591-9992',
        fax: '0-2591-9996',
        email: 'pharthai@pharmacycouncil.org',
        googleMaps: 'https://www.google.com/maps?ll=13.847316,100.530202&z=16&t=m&hl=en&gl=TH&mapclient=embed&cid=12946339027475420293',
        googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.8619933126433!2d100.52762687592553!3d13.847321395073111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b5cb4ca105b%3A0xb3aaa2c0ba72d485!2sThe%20Pharmacy%20Council%20of%20Thailand!5e0!3m2!1sen!2sth!4v1687225265014!5m2!1sen!2sth',
        // Social
        facebook: 'https://www.facebook.com/pharmacycouncil',
        line: '@PharmacyCouncil',
        youtube: 'https://www.youtube.com/@pharmacycouncil'
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
                            <label className={styles.label}>สโลแกน</label>
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
                            <label className={styles.label}>Address</label>
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
                                <label className={styles.label}>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className={styles.input}
                                    value={settings.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Fax</label>
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
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                className={styles.input}
                                value={settings.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Google Maps URL</label>
                            <input
                                type="text"
                                name="googleMaps"
                                className={styles.input}
                                value={settings.googleMaps}
                                onChange={handleInputChange}
                                placeholder="คัดลอก 'src' จากโค้ดฝังแผนที่ Google Maps"
                            />
                        </div>

                        {settings.googleMaps && (
                            <div className={styles.mapPreviewArea}>
                                <label className={styles.label}>ตัวอย่างการแสดงผลแผนที่</label>
                                <div className={styles.mapContainer}>
                                    <iframe
                                        title="Google Maps Preview"
                                        src={settings.googleMapsEmbed}
                                        width="100%"
                                        height="500"
                                        style={{ border: 0, borderRadius: '8px' }}
                                        allowFullScreen={true}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'social':
                return (
                    <div className={styles.formGrid}>
                        <h2 className={styles.tabTitle}>โซเชียลมีเดีย</h2>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Facebook Page URL</label>
                            <input
                                type="text"
                                name="facebook"
                                className={styles.input}
                                value={settings.facebook}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Line Official (ID)</label>
                            <input
                                type="text"
                                name="line"
                                className={styles.input}
                                value={settings.line}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>YouTube Channel URL</label>
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

                </aside>

                {/* Content Area */}
                <div className={styles.tabContent}>
                    {renderTabContent()}

                    <div className={styles.actions}>
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