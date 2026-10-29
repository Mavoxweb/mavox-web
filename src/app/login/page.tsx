import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}