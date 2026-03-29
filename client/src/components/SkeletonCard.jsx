import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = () => {
    return (
        <div style={{ width: '100%', maxWidth: '240px' }}>
            {/* Cover Skeleton */}
            <div 
                className="skeleton"
                style={{ 
                    width: '100%', 
                    height: '320px', 
                    borderRadius: '4px 8px 8px 4px',
                    marginBottom: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div className="shimmer-overlay" />
            </div>

            {/* Title Skeleton */}
            <div 
                className="skeleton" 
                style={{ width: '80%', height: '18px', margin: '0 auto 8px', borderRadius: '4px' }} 
            />
            
            {/* Rating Skeleton */}
            <div 
                className="skeleton" 
                style={{ width: '40%', height: '12px', margin: '0 auto 12px', borderRadius: '4px' }} 
            />

            {/* Price Skeleton */}
            <div 
                className="skeleton" 
                style={{ width: '60px', height: '32px', margin: '0 auto', borderRadius: '4px' }} 
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .shimmer-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                    animation: shimmer-swipe 1.5s infinite;
                }
                @keyframes shimmer-swipe {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
};
