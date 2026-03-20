import { useState } from "react";
import Icon from "@/components/ui/icon";

interface User {
  name: string;
  role: string;
  phone: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onLogout: () => void;
}

type IconName = "Home" | "Wrench" | "CalendarCheck" | "MapPin";

export default function Layout({
  children,
  currentPage,
  onNavigate,
  user,
  onLogout,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "services", label: "Услуги", icon: "Wrench" },
    { id: "booking", label: "Запись", icon: "CalendarCheck" },
    { id: "contacts", label: "Контакты", icon: "MapPin" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-light border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl grad-primary flex items-center justify-center shadow-lg">
              <Icon name="Gauge" size={22} className="text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold text-gray-900 tracking-wide">
                АВТОСПЕКТР
              </span>
              <span className="text-[10px] text-blue-500 font-golos font-medium tracking-widest uppercase">
                Автосервис
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  currentPage === item.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon name={item.icon as IconName} size={16} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a
              href="tel:+79132034981"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 font-medium text-sm hover:bg-orange-100 transition-colors"
            >
              <Icon name="Phone" size={15} />
              +7 913 203-49-81
            </a>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <button
                    onClick={() => onNavigate("admin")}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      currentPage === "admin"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    }`}
                  >
                    <Icon name="ShieldCheck" size={16} />
                    <span className="hidden md:inline">Админ</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigate("cabinet")}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    currentPage === "cabinet"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <Icon name="User" size={16} />
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Выйти"
                >
                  <Icon name="LogOut" size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate("auth")}
                className="px-4 py-2 rounded-xl grad-primary text-white text-sm font-medium btn-glow"
              >
                Войти
              </button>
            )}

            <button
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Icon name={mobileOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur px-4 pb-4 pt-2 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-3 transition-all ${
                    currentPage === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon name={item.icon as IconName} size={18} />
                  {item.label}
                </button>
              ))}
              <a
                href="tel:+79132034981"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-orange-600 font-medium text-sm hover:bg-orange-50"
              >
                <Icon name="Phone" size={18} />
                +7 913 203-49-81
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0D1117] text-gray-300 pt-12 pb-6 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl grad-primary flex items-center justify-center">
                  <Icon name="Gauge" size={22} className="text-white" />
                </div>
                <div>
                  <div className="font-display text-xl text-white font-bold">
                    АВТОСПЕКТР
                  </div>
                  <div className="text-xs text-blue-400 tracking-widest uppercase">
                    Автосервис
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Профессиональный сервис вашего автомобиля. Качество и честность
                — наши главные ценности.
              </p>
            </div>
            <div>
              <div className="font-display text-lg text-white font-semibold mb-4 tracking-wide">
                КОНТАКТЫ
              </div>
              <div className="space-y-3">
                <a
                  href="tel:+79132034981"
                  className="flex items-center gap-2 text-sm hover:text-orange-400 transition-colors"
                >
                  <Icon name="Phone" size={15} className="text-orange-500" />
                  +7 913 203-49-81
                </a>
                <div className="flex items-start gap-2 text-sm">
                  <Icon
                    name="MapPin"
                    size={15}
                    className="text-orange-500 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-gray-400">
                    г. Новосибирск, ул. Плотинная, 1Б
                    <br />
                    <span className="text-gray-500 text-xs">
                      (вход через Родные масла)
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="font-display text-lg text-white font-semibold mb-4 tracking-wide">
                РЕЖИМ РАБОТЫ
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Пн–Пт</span>
                  <span className="text-white">9:00 – 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Суббота</span>
                  <span className="text-white">Выходной</span>
                </div>
                <div className="flex justify-between">
                  <span>Воскресенье</span>
                  <span className="text-orange-500">Выходной</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
            © 2024 Автоспектр. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
