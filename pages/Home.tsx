import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, PieChart, Factory, PackageCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const cards = [
    {
      title: t('cardInventory'),
      desc: 'Tra cứu Hóa chất',
      icon: FlaskConical,
      path: '/inventory',
      color: 'bg-blue-600',
      shadow: 'shadow-blue-200 dark:shadow-none'
    },
    {
      title: t('cardProd'),
      desc: t('cardProdDesc'),
      icon: Factory,
      path: '/production',
      color: 'bg-orange-600',
      shadow: 'shadow-orange-200 dark:shadow-none'
    },
    {
      title: t('cardProdInv'),
      desc: t('cardProdInvDesc'),
      icon: PackageCheck,
      path: '/production-inventory',
      color: 'bg-teal-600',
      shadow: 'shadow-teal-200 dark:shadow-none'
    },
    {
      title: t('cardStats'),
      desc: 'Báo cáo chi tiết',
      icon: PieChart,
      path: '/statistics',
      color: 'bg-purple-600',
      shadow: 'shadow-purple-200 dark:shadow-none'
    }
  ];

  return (
    <div className="space-y-8 h-full flex flex-col justify-center w-full px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white transition-colors">{t('welcome')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">{t('systemDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {cards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group h-64 justify-center"
          >
            <div className={`${card.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${card.shadow} group-hover:scale-110 transition-transform`}>
              <card.icon className="text-white w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{card.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;