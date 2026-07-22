import { AlertCircle, ArrowDownToLine, Wind, Waves, Volume2, Repeat, Bath } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

const SYMPTOMS = [
  {
    id: 'slow',
    text: '물이 천천히 내려가요',
    icon: ArrowDownToLine,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    serviceType: '하수구막힘',
  },
  {
    id: 'smell',
    text: '하수구에서 악취가 올라와요',
    icon: Wind,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    serviceType: '악취',
  },
  {
    id: 'reverse',
    text: '물이 거꾸로 역류해요',
    icon: Waves,
    color: 'text-red-500',
    bg: 'bg-red-50',
    serviceType: '역류',
  },
  {
    id: 'noise',
    text: '배관에서 이상한 소리가 나요',
    icon: Volume2,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    serviceType: '기타',
  },
  {
    id: 'repeat',
    text: '뚫었는데 자꾸 다시 막혀요',
    icon: Repeat,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    serviceType: '하수구막힘',
  },
  {
    id: 'sink_toilet',
    text: '싱크대 또는 변기가 막혔어요',
    icon: Bath,
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    serviceType: '싱크대막힘',
  },
];

export default function Symptoms() {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

  const handleSelect = (id: string, serviceType: string, text: string) => {
    setSelectedSymptom(id);
    window.dispatchEvent(
      new CustomEvent('hasugu:prefill-symptom', {
        detail: { serviceType, message: `증상 선택: ${text}` },
      }),
    );
    document.getElementById('consultation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <AlertCircle size={18} />
            <span>긴급 증상 체크</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight word-break-keep">
            지금 이런 증상이 있으신가요?
          </h2>
          <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto word-break-keep">
            해당하는 증상을 선택하시면 상담폼에 자동으로 반영됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {SYMPTOMS.map((symptom, index) => {
            const isSelected = selectedSymptom === symptom.id;
            return (
              <motion.button
                key={symptom.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleSelect(symptom.id, symptom.serviceType, symptom.text)}
                className={`group flex flex-col items-center text-center p-8 rounded-[2rem] transition-all duration-300 border-2 
                  ${
                    isSelected
                      ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]'
                      : 'bg-white border-transparent shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1'
                  }`}
              >
                <div
                  className={`p-5 rounded-2xl mb-5 transition-colors duration-300 ${
                    isSelected ? 'bg-blue-50' : symptom.bg
                  } group-hover:scale-110`}
                >
                  <symptom.icon size={36} className={isSelected ? 'text-blue-600' : symptom.color} />
                </div>
                <h3
                  className={`text-lg sm:text-xl font-bold word-break-keep ${
                    isSelected ? 'text-blue-700' : 'text-slate-800'
                  }`}
                >
                  {symptom.text}
                </h3>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
