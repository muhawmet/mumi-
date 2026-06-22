import React, { useState } from 'react';
import { LabGallery } from './LabGallery';
import { BriefMockup } from './mockups/BriefMockup';
import { RecipeMockup } from './mockups/RecipeMockup';
import { SahnelerMockup } from './mockups/SahnelerMockup';
import { TimelineMockup } from './mockups/TimelineMockup';
import { Tabs } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

export const LabApp = () => {
  const [activeTab, setActiveTab] = useState('gallery');

  const tabs = [
    { id: 'gallery', label: 'UI Gallery' },
    { id: 'brief', label: 'Brief Mockup' },
    { id: 'recipe', label: 'Recipe Mockup' },
    { id: 'sahneler', label: 'Sahneler Mockup' },
    { id: 'timeline', label: 'Timeline Mockup' },
  ];

  return (
    <div className="lab-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header style={{ 
        padding: 'var(--space-4)', 
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: 24, height: 24, background: 'var(--color-gold)', borderRadius: '4px' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, letterSpacing: '0.05em' }}>MAMILAS LAB</h1>
        </div>
        <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} variant="pill" />
      </header>

      <main style={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }} className="ui-no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ minHeight: '100%', padding: 'var(--space-6)' }}
          >
            {activeTab === 'gallery' && <LabGallery />}
            {activeTab === 'brief' && <BriefMockup />}
            {activeTab === 'recipe' && <RecipeMockup />}
            {activeTab === 'sahneler' && <SahnelerMockup />}
            {activeTab === 'timeline' && <TimelineMockup />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
