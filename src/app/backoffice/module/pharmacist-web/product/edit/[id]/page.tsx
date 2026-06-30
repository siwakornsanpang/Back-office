'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm, { ProductItem } from '../../ProductForm';
import styles from '../../product.module.css';
import { authFetch } from '@/app/utils/authFetch';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/products`;

export default function EditProductPage() {
    const { id } = useParams();
    const [initialData, setInitialData] = useState<ProductItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchProductItem = async () => {
            try {
                const res = await authFetch(`${API_URL}/${id}`);
                if (!res.ok) throw new Error('Failed to fetch product item');
                const data = await res.json();
                setInitialData(data);
            } catch (err) {
                console.error(err);
                setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductItem();
    }, [id]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                    กำลังโหลดข้อมูลสินค้า...
                </div>
            </div>
        );
    }

    if (error || !initialData) {
        return (
            <div className={styles.container}>
                <div style={{ padding: '3rem', textAlign: 'center', color: '#fa5252' }}>
                    {error || 'ไม่พบข้อมูลสินค้า'}
                </div>
            </div>
        );
    }

    return <ProductForm mode="edit" initialData={initialData} />;
}
