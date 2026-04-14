'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is NairaRamp?',
    answer: 'NairaRamp is a crypto off-ramp platform that allows you to convert USDC and USDT stablecoins to Nigerian Naira (NGN) and receive funds directly in your bank account.',
  },
  {
    question: 'How long does conversion take?',
    answer: 'Most conversions are completed within 5 minutes. Once we receive your crypto deposit on the Stellar network, the NGN transfer to your bank is initiated immediately.',
  },
  {
    question: 'What are the fees?',
    answer: 'We charge a transparent 1.5% fee on all conversions. There are no hidden charges. The fee is clearly displayed before you confirm any transaction.',
  },
  {
    question: 'What is the minimum/maximum amount?',
    answer: 'The minimum conversion amount is $10 USD equivalent. Maximum limits depend on your KYC tier: Basic ($1,000/day), Standard ($5,000/day), Premium ($10,000/day).',
  },
  {
    question: 'Why do I need BVN verification?',
    answer: 'BVN verification is required by Nigerian regulations to prevent fraud and money laundering. It\\'s a one-time verification that takes less than 2 minutes.',
  },
  {
    question: 'Which banks are supported?',
    answer: 'We support all major Nigerian banks including GTBank, Access Bank, UBA, Zenith, First Bank, Fidelity, and 20+ others. If your bank accepts Naira transfers, we can send to it.',
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes. We use bank-grade encryption, don\\'t hold your crypto (direct conversion), and all transactions are verified through BVN. Your funds are never at risk.',
  },
  {
    question: 'What happens if my transaction fails?',
    answer: 'Failed transactions are automatically refunded to your Stellar wallet within 24 hours. Our support team is also available 24/7 to assist with any issues.',
  },
];

const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onClick: () => void }> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-800">
      <button
        onClick={onClick}
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-medium text-white pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-400' : 'text-slate-400'}`} 
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  // First FAQ open by default
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-slate-950 py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left Column: Title & CTA */}
        <div className="flex flex-col items-start justify-start">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            FREQUENTLY ASKED<br />QUESTIONS
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-md">
            Can't find the answer you're looking for? Reach out to our support team and we'll get back to you shortly.
          </p>
          <a 
            href="/contact"
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-primary-500/20"
          >
            Contact Support
          </a>
        </div>

        {/* Right Column: Accordion Items */}
        <div className="w-full flex flex-col">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
