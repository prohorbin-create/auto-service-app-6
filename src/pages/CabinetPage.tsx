import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { cabinetApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface CabinetPageProps {
  user: User;
  onNavigate: (page: string) => void;
}

const MOCK_CAR = {
  brand: 'Toyota',
  model: 'Camry',
  year: 2020,
  vin: 'JT2BF22K1W0072625',
  plate: 'А 123 БВ 154',
  mileage: 68400,
  color: 'Белый перламутр',
  nextTo: 'через 1600 км',
};

const MOCK_HISTORY = [
  {
    id: 'ЗН-0041',
    date: '15.03.2024',
    services: ['Замена масла и фильтра', 'Проверка тормозной системы'],
    master: 'Иванов С.А.',
    total: 3200,
    status: 'completed',
    mileage: 68400,
  },
  {
    id: 'ЗН-0035',
    date: '10.01.2024',
    services: ['ТО-60000', 'Замена воздушного фильтра', 'Диагностика ходовой'],
    master: 'Петров А.В.',
    total: 7800,
    status: 'completed',
    mileage: 62100,
  },
  {
    id: 'ЗН-0028',
    date: '22.09.2023',
    services: ['Замена передних тормозных колодок', 'Прокачка тормозов'],
    master: 'Иванов С.А.',
    total: 4500,
    status: 'completed',
    mileage: 55800,
  },
  {
    id: 'ЗН-0022',
    date: '14.06.2023',
    services: ['Замена масла', 'Шиномонтаж x4'],
    master: 'Сидоров К.Л.',
    total: 5200,
    status: 'completed',
    mileage: 49300,
  },
];

const UPCOMING = {
  id: 'ЗН-0044',
  date: '25.03.2024',
  time: '10:30',
  service: 'Плановое ТО',
  master: 'Иванов С.А.',
  status: 'scheduled',
};

const statusMap: Record<string, { label: string; color: string }> = {
  completed: { label: 'Выполнено', color: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Запланировано', color: 'bg-orange-100 text-orange-700' },
  in_progress: { label: 'В работе', color: 'bg-orange-100 text-orange-700' },
};

export default function CabinetPage({ user, onNavigate }: CabinetPageProps) {
  const [activeTab, setActiveTab] = useState<'car' | 'history' | 'notifications'>('car');
  const [car, setCar] = useState(MOCK_CAR);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user.id) return;
    setLoadingData(true);
    Promise.all([
      cabinetApi.getCar(user.id),
      cabinetApi.getHistory(user.id),
    ]).then(([carData, historyData]) => {
      if (carData.ok && carData.car) setCar({ ...MOCK_CAR, ...carData.car });
      if (historyData.ok && historyData.orders?.length) setHistory(historyData.orders);
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, [user.id]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">ЛИЧНЫЙ КАБИНЕТ</h1>
          <p className="text-gray-500 mt-1">Добро пожаловать, {user.name}</p>
        </div>
        <button
          onClick={() => onNavigate('booking')}
          className="px-6 py-3 rounded-xl grad-primary text-white font-semibold btn-glow hidden md:flex items-center gap-2"
        >
          <Icon name="CalendarPlus" size={18} />
          Записаться
        </button>
      </div>

      {/* Upcoming visit */}
      <div className="mb-6 p-5 rounded-2xl grad-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Icon name="CalendarCheck" size={24} />
            </div>
            <div>
              <div className="text-orange-100 text-sm font-medium">Ближайший визит</div>
              <div className="font-semibold text-lg">{UPCOMING.service}</div>
              <div className="text-orange-200 text-sm">{UPCOMING.date} в {UPCOMING.time} · {UPCOMING.master}</div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">{UPCOMING.id}</span>
            <span className="text-orange-200 text-xs">Запись подтверждена</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
        {[
          { id: 'car', label: 'Мой автомобиль', icon: 'Car' },
          { id: 'history', label: 'История', icon: 'ClipboardList' },
          { id: 'notifications', label: 'Уведомления', icon: 'Bell' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as 'car' | 'history' | 'notifications')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name={t.icon as 'Car'} size={16} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Car Tab */}
      {activeTab === 'car' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl grad-primary flex items-center justify-center">
                <Icon name="Car" size={22} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-900">{car.brand} {car.model}</div>
                <div className="text-gray-400 text-sm">{car.year} год</div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Гос. номер', value: car.plate },
                { label: 'VIN', value: car.vin, mono: true },
                { label: 'Цвет', value: car.color },
                { label: 'Пробег', value: `${car.mileage.toLocaleString()} км` },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className={`font-medium text-gray-800 text-sm ${item.mono ? 'font-mono text-xs' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="AlertTriangle" size={20} className="text-orange-500" />
                <div className="font-semibold text-gray-800">Следующее ТО</div>
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">{car.nextTo}</div>
              <div className="text-gray-500 text-sm">или при пробеге 70 000 км</div>
              <button
                onClick={() => onNavigate('booking')}
                className="mt-4 w-full py-2.5 rounded-xl grad-accent text-white font-medium text-sm btn-orange-glow"
              >
                Записаться на ТО
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="font-semibold text-gray-800 mb-3">Последний визит</div>
              <div className="text-sm text-gray-500 mb-1">{history[0].date}</div>
              <div className="space-y-1">
                {history[0].services.map((s, i) => (
                  <div key={i} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">{history[0].id}</span>
                <span className="font-bold text-gray-800">{history[0].total.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">{item.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[item.status].color}`}>
                      {statusMap[item.status].label}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-800">{item.date}</div>
                  <div className="text-sm text-gray-400">Мастер: {item.master} · {item.mileage.toLocaleString()} км</div>
                </div>
                <div className="text-xl font-bold text-gray-800">{item.total.toLocaleString()} ₽</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.services.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs border border-gray-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 animate-fade-in">
          {[
            { icon: 'Bell', color: 'text-orange-500 bg-orange-50', title: 'Напоминание о ТО', desc: 'Плановое ТО через 1600 км. Рекомендуем записаться заранее.', time: '2 дня назад' },
            { icon: 'CheckCircle', color: 'text-green-500 bg-green-50', title: 'Автомобиль готов', desc: 'Ваш Toyota Camry готов к выдаче. Заказ-наряд ЗН-0041 выполнен.', time: '5 дней назад' },
            { icon: 'Wrench', color: 'text-orange-500 bg-orange-50', title: 'Начало работ', desc: 'Мастер Иванов С.А. приступил к обслуживанию вашего автомобиля.', time: '5 дней назад' },
            { icon: 'CalendarCheck', color: 'text-purple-500 bg-purple-50', title: 'Запись подтверждена', desc: 'Запись на 25.03.2024 в 10:30 подтверждена. Ждём вас!', time: '1 неделю назад' },
          ].map((n, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${n.color} flex items-center justify-center flex-shrink-0`}>
                <Icon name={n.icon as 'Bell'} size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 mb-1">{n.title}</div>
                <div className="text-sm text-gray-500">{n.desc}</div>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">{n.time}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 md:hidden">
        <button
          onClick={() => onNavigate('booking')}
          className="w-full py-4 rounded-2xl grad-primary text-white font-semibold btn-glow flex items-center justify-center gap-2"
        >
          <Icon name="CalendarPlus" size={18} />
          Записаться на обслуживание
        </button>
      </div>
    </div>
  );
}