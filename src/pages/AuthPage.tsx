import { useState } from "react";
import Icon from "@/components/ui/icon";

interface AuthPageProps {
  onLogin: (user: { name: string; role: string; phone: string }) => void;
  onNavigate: (page: string) => void;
}

const DEMO_USERS = [
  {
    phone: "79001234567",
    password: "client123",
    name: "Александр Петров",
    role: "client",
  },
  {
    phone: "79132034981",
    password: "249322",
    name: "Администратор",
    role: "admin",
  },
];

export default function AuthPage({ onLogin, onNavigate }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    let result = "";
    if (digits.length > 0) result = "+7";
    if (digits.length > 1) result += " " + digits.slice(1, 4);
    if (digits.length > 4) result += " " + digits.slice(4, 7);
    if (digits.length > 7) result += "-" + digits.slice(7, 9);
    if (digits.length > 9) result += "-" + digits.slice(9, 11);
    return result;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const limited = raw.startsWith("7") ? raw : "7" + raw;
    setPhone(formatPhone(limited.slice(0, 11)));
  };

  const getDigits = () => phone.replace(/\D/g, "");

  const handleLogin = () => {
    setError("");
    const digits = getDigits();
    const user = DEMO_USERS.find(
      (u) => u.phone === digits && u.password === password,
    );
    if (user) {
      onLogin({ name: user.name, role: user.role, phone: digits });
    } else {
      setError("Неверный номер телефона или пароль");
    }
  };

  const handleRegister = () => {
    setError("");
    setSuccess("");
    const digits = getDigits();
    if (!name.trim()) {
      setError("Введите ваше имя");
      return;
    }
    if (digits.length < 11) {
      setError("Введите корректный номер телефона");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    setSuccess("Аккаунт создан! Теперь вы можете войти.");
    setMode("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-100 via-white to-orange-50">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate("home")}
            className="inline-flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-2xl grad-primary flex items-center justify-center shadow-xl">
              <Icon name="Gauge" size={32} className="text-white" />
            </div>
            <div className="font-display text-2xl font-bold text-gray-900 tracking-wide">
              АВТОСПЕКТР
            </div>
          </button>
          <p className="text-gray-500 mt-2 text-sm">Личный кабинет клиента</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-gray-100">
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`py-4 font-semibold text-sm transition-all ${mode === "login" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              Войти
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`py-4 font-semibold text-sm transition-all ${mode === "register" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              Регистрация
            </button>
          </div>

          <div className="p-8">
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                <Icon name="CheckCircle" size={16} />
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ваше имя
                  </label>
                  <div className="relative">
                    <Icon
                      name="User"
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Александр Петров"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-800 text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Номер телефона
                </label>
                <div className="relative">
                  <Icon
                    name="Phone"
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 900 000-00-00"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-800 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {mode === "register" ? "Придумайте пароль" : "Пароль"}
                </label>
                <div className="relative">
                  <Icon
                    name="Lock"
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "register"
                        ? "Минимум 6 символов"
                        : "Введите пароль"
                    }
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-800 text-sm transition-all"
                    onKeyDown={(e) =>
                      e.key === "Enter" && mode === "login" && handleLogin()
                    }
                  />
                </div>
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <Icon
                      name="Lock"
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-800 text-sm transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={mode === "login" ? handleLogin : handleRegister}
                className="w-full py-3.5 rounded-xl grad-primary text-white font-semibold text-base btn-glow transition-all mt-2"
              >
                {mode === "login" ? "Войти в кабинет" : "Создать аккаунт"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
