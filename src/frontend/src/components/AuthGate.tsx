import { useState } from "react";
import { LoginScreen } from "./LoginScreen";

interface AuthGateProps {
  children: (phone: string, onLogout: () => void) => React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [phone, setPhone] = useState<string | null>(() =>
    localStorage.getItem("upi_auth_phone"),
  );

  const handleLogin = (p: string) => {
    localStorage.setItem("upi_auth_phone", p);
    setPhone(p);
  };

  const handleLogout = () => {
    localStorage.removeItem("upi_auth_phone");
    setPhone(null);
  };

  if (!phone) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <>{children(phone, handleLogout)}</>;
}
