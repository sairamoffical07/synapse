import React from 'react';
import { Mail, ShieldCheck, Lock, LogOut } from 'lucide-react';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { user, logout } = useAuth();

  const facts = [
    {
      icon: ShieldCheck,
      title: 'Your library is private',
      text: 'Uploaded materials and their indexed passages are scoped to your account. Answers, quizzes and flashcards only draw on your own documents.',
    },
    {
      icon: Lock,
      title: 'Token-based sign-in',
      text: 'Your session uses a signed token stored in this browser. Signing out removes it from this device.',
    },
  ];

  return (
    <div className="max-w-3xl space-y-10">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="The account you’re signed in with and how Synapse handles your materials."
      />

      <section
        className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6 bg-yellow dot-grid border-2 border-black rounded-xl shadow-brut-lg"
        aria-labelledby="profile-account"
      >
        <div className="w-16 h-16 rounded-lg bg-black text-yellow flex items-center justify-center font-display text-3xl font-extrabold shrink-0">
          {user?.email ? user.email.charAt(0).toUpperCase() : 'S'}
        </div>
        <div className="min-w-0 space-y-1">
          <h2 id="profile-account" className="text-3xl text-black truncate">
            {user?.name || 'Student account'}
          </h2>
          <p className="text-[15px] font-bold text-black flex items-center gap-1.5 min-w-0">
            <Mail className="w-4 h-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            <span className="truncate">{user?.email}</span>
          </p>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="profile-privacy">
        <h2 id="profile-privacy" className="text-3xl text-black">Privacy &amp; security</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {facts.map(({ icon: Icon, title, text }) => (
            <li key={title} className="group p-5 bg-white border-2 border-black rounded-xl shadow-brut space-y-3">
              <span className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-sage border-2 border-black text-black group-hover:bg-yellow transition-colors">
                <Icon className="w-5 h-5" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <p className="font-display text-xl font-extrabold text-black">{title}</p>
              <p className="text-[15px] text-gray-700 leading-relaxed">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-end">
        <Button variant="destructive" icon={LogOut} onClick={logout}>
          Sign out of Synapse
        </Button>
      </div>
    </div>
  );
};
