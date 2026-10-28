import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, BookOpen } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { AuthLayout } from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('1');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Keep the form locked during the post-success redirect so a second click can't re-submit
    if (loading || successMsg) return;
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Matches the backend's @Size(min = 8) rule on RegisterRequest
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    const res = await register(fullName, email, password, university, course, year);
    if (res.success) {
      setSuccessMsg('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-7">
        <div className="space-y-1.5">
          <h1 className="text-4xl sm:text-5xl leading-[1.05] text-black">Create your workspace</h1>
          <p className="text-base text-gray-700">Set up a student account to start organizing your study materials.</p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="inline-block px-2 py-0.5 mb-3 bg-sage border-2 border-black rounded-md text-[13px] font-bold uppercase tracking-wider text-black">Account</legend>
            <Input
              label="Full name"
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email address"
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="jane@university.edu"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm password"
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                required
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="inline-block px-2 py-0.5 mb-3 bg-sage border-2 border-black rounded-md text-[13px] font-bold uppercase tracking-wider text-black">
              Studies <span className="normal-case tracking-normal font-normal">(optional)</span>
            </legend>
            <Input
              label="University"
              id="register-university"
              type="text"
              autoComplete="organization"
              placeholder="Your university or college"
              icon={GraduationCap}
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_8.5rem] gap-4">
              <Input
                label="Course or program"
                id="register-course"
                type="text"
                placeholder="Computer Science"
                icon={BookOpen}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />

              <Select label="Year" id="register-year" value={year} onChange={(e) => setYear(e.target.value)}>
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </Select>
            </div>
          </fieldset>

          <Button type="submit" variant="primary" size="lg" prominent className="w-full" isLoading={loading} disabled={Boolean(successMsg)}>
            Create account
          </Button>
        </form>

        <p className="pt-6 border-t-2 border-black text-center text-[15px] text-black">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-black underline underline-offset-4 decoration-2 hover:bg-yellow rounded px-0.5">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
