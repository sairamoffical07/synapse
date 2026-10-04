import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 items-center justify-center text-white shadow-md border border-blue-400/30 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase">SYNAPSE</h1>
          <p className="text-xs text-slate-400 font-medium tracking-tight">KNOWLEDGE, CONNECTED.</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-[#111726] border border-[#26334a] rounded-xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-200">Sign in to your workspace</h2>
            <p className="text-xs text-slate-400">Access your academic materials and AI assistant</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="student@university.edu"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-[#1f293d] text-center text-xs text-slate-400">
            Don't have a Synapse account?{' '}
            <Link to="/register" className="text-blue-400 font-medium hover:underline">
              Create student account
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-500">
          AI-Powered Academic Knowledge System
        </p>
      </div>
    </div>
  );
};
