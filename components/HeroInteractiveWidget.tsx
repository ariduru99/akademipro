"use client";

import React, { useState } from 'react';
import { Sparkles, TrendingUp, Clock, ShieldCheck, ArrowRight, CheckCircle2, Zap, Users, Award } from 'lucide-react';
import Link from 'next/link';

type ProfileType = 'tutor' | 'boutique' | 'academy';

export function HeroInteractiveWidget() {
  const [profile, setProfile] = useState<ProfileType>('tutor');
  const [actionTriggered, setActionTriggered] = useState(false);

  const profileData = {
    tutor: {
      title: "Bireysel Eğitmenler",
      studentCount: "10 - 50 Öğrenci",
      timeSaved: "Ayda 24 Saat",
      revenueBoost: "+%35",
      description: "Öğrenci taksitleri, WhatsApp gruplarından link paylaşımı ve elden ödeme takibinin getirdiği zaman kaybını tamamen sıfırlayın.",
      perks: [
        "Otomatik taksit ve ödeme hatırlatıcılar",
        "Tek tıkla güvenli sanal sınıf linki",
        "Kişiselleştirilmiş eğitmen profil sayfası"
      ]
    },
    boutique: {
      title: "Butik Kurs & Atölyeler",
      studentCount: "50 - 200 Öğrenci",
      timeSaved: "Ayda 60 Saat",
      revenueBoost: "+%50",
      description: "Birden fazla eğitmenin programını, salon/oda çakışmalarını ve veli bilgilendirmelerini kusursuz bir kurumsal düzene sokun.",
      perks: [
        "Eğitmen ve salon bazlı akıllı takvim",
        "Velilere anlık yoklama ve başarı raporu",
        "Ön muhasebe ve eğitmen hakediş takibi"
      ]
    },
    academy: {
      title: "Büyük Kurumlar",
      studentCount: "200+ Öğrenci",
      timeSaved: "Ayda 140 Saat",
      revenueBoost: "+%80",
      description: "Tüm şubelerinizdeki finansal akışı, online/yüz yüze karma eğitim süreçlerini ve kurumsal prestijinizi tek ekrandan yönetin.",
      perks: [
        "Gelişmiş rol ve yetkilendirme sistemi",
        "Toplu SMS, duyuru ve Resend mail altyapısı",
        "Detaylı kurum içi ciro ve verimlilik analitiği"
      ]
    }
  };

  const current = profileData[profile];

  const handleSimulateAction = () => {
    setActionTriggered(true);
    setTimeout(() => {
      setActionTriggered(false);
    }, 3500);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Decorative Glow Backgrounds */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-primary-400/30 to-secondary-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-emerald-400/20 to-primary-500/20 rounded-full blur-3xl -z-10"></div>

      {/* Floating Accent Tag */}
      <div className="absolute -top-5 right-6 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20 animate-pulse">
        <Sparkles className="w-3.5 h-3.5" /> İnteraktif Potansiyel Keşfi
      </div>

      {/* Main Glassmorphic Container */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Header Title */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Eğitim Modelinizi Seçin</h3>
          <p className="text-lg font-extrabold text-slate-800">Sizin İçin Kazanım Potansiyelini Hesaplayalım</p>
        </div>

        {/* Interactive Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            onClick={() => setProfile('tutor')}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex flex-col items-center gap-1 ${
              profile === 'tutor' 
                ? 'bg-white text-primary-600 shadow-md transform scale-[1.02]' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="truncate w-full text-center">Eğitmen</span>
          </button>
          
          <button
            onClick={() => setProfile('boutique')}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex flex-col items-center gap-1 ${
              profile === 'boutique' 
                ? 'bg-white text-primary-600 shadow-md transform scale-[1.02]' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="truncate w-full text-center">Butik Kurs</span>
          </button>

          <button
            onClick={() => setProfile('academy')}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex flex-col items-center gap-1 ${
              profile === 'academy' 
                ? 'bg-white text-primary-600 shadow-md transform scale-[1.02]' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="truncate w-full text-center">Kurum</span>
          </button>
        </div>

        {/* Dynamic Content Display with seamless change transition */}
        <div className="bg-gradient-to-br from-slate-50 to-primary-50/30 rounded-2xl p-5 border border-primary-100/50 mb-6 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/60">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Ölçek</span>
              <span className="text-sm font-extrabold text-primary-700">{current.studentCount}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">Operasyonel Tasarruf</span>
              <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5" /> {current.timeSaved}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-xs font-bold text-slate-500 block mb-1">Tahmini Finansal Büyüme</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{current.revenueBoost}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Kaçak ders & tahsilat kaybı önleme
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-medium">
            {current.description}
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-200/60">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">Sistemin Sağladığı Ayrıcalıklar</span>
            {current.perks.map((perk, index) => (
              <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Simulation Action Trigger */}
        <div className="relative">
          <button
            onClick={handleSimulateAction}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 hover:from-primary-700 to-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 group-hover:scale-125 transition-transform" />
            <span>Sistem Otomasyonunu Canlı Test Et</span>
          </button>

          {/* Simulation Toast Overlay */}
          {actionTriggered && (
            <div className="absolute inset-x-0 bottom-full mb-3 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in-up z-30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Otomasyon Tetiklendi</p>
                  <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-medium">
                    Sanal sınıf linki ve ödeme hatırlatması tüm velilere anında güvenli SMS/Mail olarak iletildi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Link */}
        <div className="mt-4 text-center">
          <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors">
            <span>Sistemi kendi verilerinizle denemek için</span>
            <span className="underline underline-offset-2 flex items-center gap-0.5">
              ücretsiz başlayın <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}
