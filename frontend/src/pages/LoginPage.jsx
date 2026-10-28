import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { takeSessionNotice } from '../api/client';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Why the user was sent here (expired or invalid session), shown once
  const [notice, setNotice] = useState(takeSessionNotice);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice(null);

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid email or password.');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-7">
        <div className="space-y-1.5">
          <h1 className="text-4xl sm:text-5xl leading-[1.05] text-black">Welcome back</h1>
          <p className="text-base text-gray-700">Sign in to continue with your materials and study sessions.</p>
        </div>

        {notice && !error && <Alert variant="info">{notice}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" prominent className="w-full mt-3" isLoading={loading}>
            Sign in
          </Button>
        </form>

        <p className="pt-6 border-t-2 border-black text-center text-[15px] text-black">
          New to Synapse?{' '}
          <Link to="/register" className="font-bold text-black underline underline-offset-4 decoration-2 hover:bg-yellow rounded px-0.5">
            Create a student account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
