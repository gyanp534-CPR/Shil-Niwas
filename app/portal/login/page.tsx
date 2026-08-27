import { LoginForm } from "@/components/portal/LoginForm";

export default function PortalLoginPage() {
  return (
    <div className="max-w-sm mx-auto space-y-4 pt-8">
      <div className="text-center">
        <h2 className="text-base font-medium">Tenant login</h2>
        <p className="text-xs text-gray-500 mt-1">Shil Niwas</p>
      </div>
      <LoginForm />
    </div>
  );
}
