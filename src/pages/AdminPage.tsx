import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { ordersApi } from '@/lib/api';

type OrderStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

interface Order {
  id: string;
  client: string;
  phone: string;
  car: string;
  service: string;
  date: string;
  time: string;
  master: string;
  status: OrderStatus;
  total: number;
  comment: string;
}

const INITIAL_ORDERS: Order[] = [
  { id: 'ЗН-0044', client: 'Александр Петров', phone: '+7 900 123-45-67', car: 'Toyota Camry 2020', service: 'Плановое ТО', date: '25.03.2024', time: '10:30', master: 'Иванов С.А.', status: 'scheduled', total: 7500, comment: '' },
  { id: 'ЗН-0045', client: 'Михаил Сидоров', phone: '+7 913 555-12-34', car: 'Kia Rio 2019', service: 'Замена масла и фильтра', date: '25.03.2024', time: '12:00', master: 'Петров А.В.', status: 'in_progress', total: 1200, comment: 'Клиент просит использовать 5W30' },
  { id: 'ЗН-0046', client: 'Ольга Новикова', phone: '+7 923 777-88-99', car: 'Hyundai Solaris 2021', service: 'Компьютерная диагностика', date: '25.03.2024', time: '14:00', master: 'Иванов С.А.', status: 'scheduled', total: 1000, comment: '' },
  { id: 'ЗН-0047', client: 'Дмитрий Козлов', phone: '+7 905 321-65-87', car: 'Volkswagen Polo 2018', service: 'Шиномонтаж x4', date: '26.03.2024', time: '9:00', master: 'Сидоров К.Л.', status: 'scheduled', total: 1600, comment: 'Летние на летние' },
  { id: 'ЗН-0043', client: 'Ирина Федорова', phone: '+7 913 444-22-11', car: 'LADA Vesta 2022', service: 'Ремонт подвески', date: '24.03.2024', time: '11:00', master: 'Петров А.В.', status: 'completed', total: 8500, comment: '' },
  { id: 'ЗН-0042', client: 'Сергей Морозов', phone: '+7 923 666-33-55', car: 'Ford Focus 2017', service: 'Замена тормозных колодок', date: '23.03.2024', time: '15:00', master: 'Иванов С.А.', status: 'completed', total: 3200, comment: '' },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; dotColor: string }> = {
  scheduled: { label: 'Запланировано', color: 'bg-orange-50 text-orange-700', dotColor: 'bg-orange-500' },
  in_progress: { label: 'В работе', color: 'bg-orange-50 text-orange-700', dotColor: 'bg-orange-500' },
  completed: { label: 'Выполнено', color: 'bg-green-50 text-green-700', dotColor: 'bg-green-500' },
  cancelled: { label: 'Отменено', color: 'bg-red-50 text-red-600', dotColor: 'bg-red-400' },
};

const masters = ['Иванов С.А.', 'Петров А.В.', 'Сидоров К.Л.'];
const servicesList = ['Замена масла и фильтра', 'Плановое ТО', 'Компьютерная диагностика', 'Замена тормозных колодок', 'Шиномонтаж / балансировка', 'Ремонт подвески', 'Заправка кондиционера', 'Развал-схождение', 'Другое'];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'create'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Order>>({});
  const [search, setSearch] = useState('');

  // New order form
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    client: '', phone: '', car: '', service: '', date: '', time: '', master: masters[0], status: 'scheduled', total: 0, comment: '',
  });

  useEffect(() => {
    ordersApi.getAll().then(data => {
      if (data.ok && data.orders?.length) {
        setOrders(data.orders.map((o: Record<string, unknown>) => ({
          id: String(o.order_number),
          client: String(o.client_name),
          phone: String(o.client_phone),
          car: String(o.car || ''),
          service: String(o.service),
          date: String(o.date),
          time: String(o.time),
          master: String(o.master || ''),
          status: String(o.status) as OrderStatus,
          total: Number(o.total) || 0,
          comment: String(o.comment || ''),
        })));
      }
    }).catch(() => {}).finally(() => setLoadingOrders(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch = !search || o.client.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search) || o.phone.includes(search);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: orders.length,
    scheduled: orders.filter(o => o.status === 'scheduled').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0),
  };

  const saveEdit = () => {
    setOrders(prev => prev.map(o => o.id === editingId ? { ...o, ...editData } : o));
    setEditingId(null);
    setEditData({});
  };

  const createOrder = () => {
    ordersApi.create({
      client_name: newOrder.client,
      client_phone: newOrder.phone,
      car: newOrder.car,
      service: newOrder.service,
      date: newOrder.date,
      time: newOrder.time,
      master: newOrder.master,
      total: newOrder.total,
      comment: newOrder.comment,
      status: newOrder.status,
    }).then(data => {
      if (data.ok) {
        const id = data.order_number || `ЗН-${String(Date.now()).slice(-4)}`;
        setOrders(prev => [{ ...newOrder as Order, id }, ...prev]);
      }
    }).catch(() => {});
    setNewOrder({ client: '', phone: '', car: '', service: '', date: '', time: '', master: masters[0], status: 'scheduled', total: 0, comment: '' });
    setActiveTab('orders');
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    ordersApi.updateStatus(Number(id.replace(/\D/g, '')) || 0, status).catch(() => {});
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">АДМИН ПАНЕЛЬ</h1>
          <p className="text-gray-500 mt-1">Управление записями и заказ-нарядами</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="px-6 py-3 rounded-xl grad-primary text-white font-semibold flex items-center gap-2 btn-glow"
        >
          <Icon name="Plus" size={18} />
          <span className="hidden md:inline">Новый заказ-наряд</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Всего', value: stats.total, icon: 'ClipboardList', color: 'text-gray-600 bg-gray-50' },
          { label: 'Запланировано', value: stats.scheduled, icon: 'Calendar', color: 'text-orange-500 bg-orange-50' },
          { label: 'В работе', value: stats.in_progress, icon: 'Wrench', color: 'text-orange-600 bg-orange-50' },
          { label: 'Выполнено', value: stats.completed, icon: 'CheckCircle', color: 'text-green-600 bg-green-50' },
          { label: 'Выручка', value: `${stats.revenue.toLocaleString()} ₽`, icon: 'TrendingUp', color: 'text-purple-600 bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <Icon name={s.icon as 'ClipboardList'} size={18} />
            </div>
            <div className="font-bold text-xl text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { id: 'orders', label: 'Заказ-наряды', icon: 'ClipboardList' },
          { id: 'create', label: 'Создать', icon: 'Plus' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as 'orders' | 'create')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon name={t.icon as 'ClipboardList'} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по клиенту, номеру или телефону..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    filterStatus === s ? 'grad-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'Все' : statusConfig[s as OrderStatus]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-3">
            {filtered.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {editingId === order.id ? (
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {[
                        { key: 'client', label: 'Клиент', type: 'text' },
                        { key: 'phone', label: 'Телефон', type: 'text' },
                        { key: 'car', label: 'Автомобиль', type: 'text' },
                        { key: 'date', label: 'Дата', type: 'text' },
                        { key: 'time', label: 'Время', type: 'text' },
                        { key: 'total', label: 'Сумма (₽)', type: 'number' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                          <input
                            type={field.type}
                            value={String(editData[field.key as keyof Order] ?? order[field.key as keyof Order])}
                            onChange={e => setEditData(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Статус</label>
                        <select
                          value={String(editData.status ?? order.status)}
                          onChange={e => setEditData(prev => ({ ...prev, status: e.target.value as OrderStatus }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm"
                        >
                          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Мастер</label>
                        <select
                          value={String(editData.master ?? order.master)}
                          onChange={e => setEditData(prev => ({ ...prev, master: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm"
                        >
                          {masters.map(m => <option key={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={saveEdit} className="px-5 py-2 rounded-xl grad-primary text-white font-medium text-sm btn-glow">Сохранить</button>
                      <button onClick={() => { setEditingId(null); setEditData({}); }} className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Отмена</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-bold text-gray-500">{order.id}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[order.status].dotColor}`} />
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingId(order.id); }} className="p-2 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors">
                          <Icon name="Pencil" size={15} />
                        </button>
                        <button onClick={() => deleteOrder(order.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Icon name="Trash2" size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Клиент</div>
                        <div className="font-semibold text-gray-800">{order.client}</div>
                        <div className="text-sm text-gray-500">{order.phone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Автомобиль</div>
                        <div className="font-semibold text-gray-800">{order.car}</div>
                        <div className="text-sm text-gray-500">{order.service}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Дата и время</div>
                        <div className="font-semibold text-gray-800">{order.date} · {order.time}</div>
                        <div className="text-sm text-gray-500">Мастер: {order.master}</div>
                      </div>
                    </div>

                    {order.comment && (
                      <div className="mt-3 p-3 rounded-xl bg-gray-50 text-sm text-gray-600">
                        <Icon name="MessageSquare" size={13} className="inline mr-1.5 text-gray-400" />
                        {order.comment}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {(Object.keys(statusConfig) as OrderStatus[]).filter(s => s !== order.status).map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:opacity-80 ${statusConfig[s].color} border-current/20`}
                          >
                            → {statusConfig[s].label}
                          </button>
                        ))}
                      </div>
                      <div className="font-bold text-lg text-gray-800">{order.total.toLocaleString()} ₽</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Order */}
      {activeTab === 'create' && (
        <div className="animate-fade-in bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
            <Icon name="FilePlus" size={20} className="text-orange-500" />
            Новый заказ-наряд
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { key: 'client', label: 'Имя клиента', placeholder: 'Александр Петров', type: 'text' },
              { key: 'phone', label: 'Телефон', placeholder: '+7 900 000-00-00', type: 'text' },
              { key: 'car', label: 'Автомобиль', placeholder: 'Toyota Camry 2020', type: 'text' },
              { key: 'date', label: 'Дата', placeholder: '25.03.2024', type: 'text' },
              { key: 'time', label: 'Время', placeholder: '10:00', type: 'text' },
              { key: 'total', label: 'Стоимость (₽)', placeholder: '0', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={String(newOrder[field.key as keyof Order] ?? '')}
                  onChange={e => setNewOrder(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Услуга</label>
              <select
                value={newOrder.service}
                onChange={e => setNewOrder(prev => ({ ...prev, service: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm"
              >
                <option value="">Выберите услугу</option>
                {servicesList.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Мастер</label>
              <select
                value={newOrder.master}
                onChange={e => setNewOrder(prev => ({ ...prev, master: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm"
              >
                {masters.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Комментарий</label>
              <textarea
                value={newOrder.comment}
                onChange={e => setNewOrder(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Особые пожелания, замечания..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={createOrder}
              disabled={!newOrder.client || !newOrder.car || !newOrder.service}
              className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
                newOrder.client && newOrder.car && newOrder.service
                  ? 'grad-primary text-white btn-glow'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Создать заказ-наряд
            </button>
            <button onClick={() => setActiveTab('orders')} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}