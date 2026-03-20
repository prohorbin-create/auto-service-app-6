import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { bookingsApi } from '@/lib/api';

interface BookingPageProps {
  user: { id: string; name: string; role: string; phone: string } | null;
  onNavigate: (page: string) => void;
}

const services = [
  'Замена масла и фильтра',
  'Плановое ТО',
  'Компьютерная диагностика',
  'Замена тормозных колодок',
  'Шиномонтаж / балансировка',
  'Ремонт подвески',
  'Заправка кондиционера',
  'Развал-схождение',
  'Другое',
];

const times = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const getDates = () => {
  const dates = [];
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() !== 0) {
      dates.push(d);
    }
  }
  return dates.slice(0, 10);
};

const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export default function BookingPage({ user, onNavigate }: BookingPageProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [phone, setPhone] = useState(user ? `+7 ${user.phone.slice(1, 4)} ${user.phone.slice(4, 7)}-${user.phone.slice(7, 9)}-${user.phone.slice(9)}` : '');
  const [name, setName] = useState(user?.name || '');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const dates = getDates();

  const canNext = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return !!name && !!phone;
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedDate) return;
    await bookingsApi.create({
      name,
      phone,
      service: selectedService,
      date: `${selectedDate.getDate()} ${months[selectedDate.getMonth()]}`,
      time: selectedTime,
      comment,
    }, user?.id).catch(() => {});
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in max-w-lg">
        <div className="w-24 h-24 rounded-full grad-primary flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Icon name="CheckCircle" size={48} className="text-white" />
        </div>
        <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">ЗАПИСЬ ПРИНЯТА!</h2>
        <p className="text-gray-500 mb-2">
          Ваша запись на <strong>{selectedService}</strong> успешно оформлена.
        </p>
        {selectedDate && (
          <p className="text-gray-500 mb-8">
            <strong>{selectedDate.getDate()} {months[selectedDate.getMonth()]}</strong> в <strong>{selectedTime}</strong>
          </p>
        )}
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-sm text-orange-700 mb-8">
          <Icon name="Bell" size={16} className="inline mr-2" />
          Мы отправим вам SMS-напоминание за сутки до визита
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => { setSubmitted(false); setStep(1); setSelectedService(''); setSelectedDate(null); setSelectedTime(''); }} className="px-8 py-3 rounded-xl grad-primary text-white font-semibold btn-glow">
            Новая запись
          </button>
          <button onClick={() => onNavigate(user ? 'cabinet' : 'home')} className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            {user ? 'В личный кабинет' : 'На главную'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">ЗАПИСЬ НА СЕРВИС</h1>
        <p className="text-gray-500">Автосервис Автоспектр · г. Новосибирск</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
              step > s ? 'grad-primary text-white' : step === s ? 'grad-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s ? <Icon name="Check" size={14} /> : s}
            </div>
            <div className={`text-xs font-medium hidden sm:block ${step >= s ? 'text-gray-700' : 'text-gray-400'}`}>
              {s === 1 ? 'Услуга' : s === 2 ? 'Дата и время' : 'Контакты'}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-orange-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
              <Icon name="Wrench" size={20} className="text-blue-500" />
              Выберите услугу
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {services.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedService(s)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${
                    selectedService === s
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-100 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {s}
                    {selectedService === s && <Icon name="CheckCircle" size={18} className="text-orange-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
              <Icon name="Calendar" size={20} className="text-orange-500" />
              Выберите дату и время
            </h2>

            <div className="mb-6">
              <div className="text-sm font-medium text-gray-600 mb-3">Дата</div>
              <div className="grid grid-cols-5 gap-2">
                {dates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(d)}
                    className={`py-3 rounded-xl text-center border-2 transition-all ${
                      selectedDate?.getDate() === d.getDate()
                        ? 'border-orange-500 grad-primary text-white'
                        : 'border-gray-100 hover:border-orange-200 text-gray-700'
                    }`}
                  >
                    <div className="text-xs opacity-70">{weekDays[d.getDay()]}</div>
                    <div className="font-bold text-lg leading-tight">{d.getDate()}</div>
                    <div className="text-xs opacity-70">{months[d.getMonth()]}</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="animate-fade-in">
                <div className="text-sm font-medium text-gray-600 mb-3">Время</div>
                <div className="grid grid-cols-5 gap-2">
                  {times.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                        selectedTime === t
                          ? 'border-orange-500 grad-primary text-white'
                          : 'border-gray-100 hover:border-orange-200 text-gray-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
              <Icon name="User" size={20} className="text-orange-500" />
              Ваши данные
            </h2>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 mb-6">
              <div className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">Запись</div>
              <div className="font-semibold text-gray-800">{selectedService}</div>
              {selectedDate && <div className="text-sm text-gray-500 mt-1">{selectedDate.getDate()} {months[selectedDate.getMonth()]} в {selectedTime}</div>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ваше имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Александр Петров"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+7 900 000-00-00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Комментарий (необязательно)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Марка и модель автомобиля, особые пожелания..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-800 text-sm resize-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                <Icon name="Bell" size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-500">Мы отправим SMS-подтверждение и напомним о визите за день.</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Назад
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            disabled={!canNext()}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              canNext() ? 'grad-primary text-white btn-glow' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step < 3 ? 'Далее' : 'Подтвердить запись'}
          </button>
        </div>
      </div>
    </div>
  );
}