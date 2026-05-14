import { LoginForm } from './LoginForm';

export const metadata = { title: 'Admin login' };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl uppercase">Admin login</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Use the password from the <code className="bg-neutral-100 px-1.5 py-0.5 rounded">ADMIN_PASSWORD</code> env var.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
