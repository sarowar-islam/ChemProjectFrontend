import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { TeamMember } from '@/services/types';

export default function TeamLoginPage() {
  const navigate = useNavigate();
  const { login, isMember } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [identifiedMember, setIdentifiedMember] = useState<TeamMember | null>(null);
  const [identifierError, setIdentifierError] = useState('');
  const [identifierLoading, setIdentifierLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [forgotPasswordOption, setForgotPasswordOption] = useState<'email' | 'securityCode' | null>(null);
  const [resetStep, setResetStep] = useState<'identify' | 'chooseOption' | 'enterCode' | 'setPassword'>('identify');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Redirect if already logged in as member
  if (isMember) {
    navigate('/member/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await authService.loginMember(username, password);

    if (res.success && res.user && res.token) {
      login(res.user, res.token);
      navigate('/member/dashboard');
    } else {
      setError(res.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  const resetState = () => {
    setResetIdentifier('');
    setResetEmail('');
    setIdentifiedMember(null);
    setIdentifierError('');
    setIdentifierLoading(false);
    setResetCode('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setForgotPasswordOption(null);
    setResetStep('identify');
    setShowResetNewPassword(false);
    setShowResetConfirmPassword(false);
    setResetError('');
    setResetMessage('');
    setResetLoading(false);
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    resetState();
  };

  const backToLogin = () => {
    setShowForgotPassword(false);
    resetState();
  };

  const handleVerifyIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError('');
    setResetMessage('');
    setResetError('');
    setIdentifierLoading(true);

    const identifier = resetIdentifier.trim();
    if (!identifier) {
      setIdentifierError('Please enter your username or email.');
      setIdentifierLoading(false);
      return;
    }

    const response = await authService.lookupMemberByIdentifier(identifier);

    if (!response.success || !response.data) {
      setIdentifierError('Invalid username or email. Please check and try again.');
      setIdentifierLoading(false);
      return;
    }

    setIdentifiedMember(response.data);
    setResetEmail(response.data.email);
    setResetStep('chooseOption');
    setResetMessage('We found your account. Choose how you want to verify your identity.');
    setIdentifierLoading(false);
  };

  const resetOptionState = () => {
    setResetCode('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError('');
    setResetMessage('');
    setResetStep('enterCode');
  };

  const handleSelectEmailReset = async () => {
    if (!identifiedMember) return;

    setForgotPasswordOption('email');
    setResetError('');
    setResetMessage('');
    setResetLoading(true);

    const response = await authService.requestMemberPasswordReset(resetEmail);

    if (response.success) {
      setResetMessage(response.message || `A verification code was sent to ${resetEmail}.`);
      setResetStep('enterCode');
    } else {
      setResetError(response.error || 'Unable to send the reset code. Please try again.');
    }

    setResetLoading(false);
  };

  const handleSelectSecurityCodeReset = () => {
    if (!identifiedMember) return;

    setForgotPasswordOption('securityCode');
    setResetError('');
    setResetMessage(
      'Ask an admin to generate your security code. When you receive it, enter it below to continue.'
    );
    setResetStep('enterCode');
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetLoading(true);

    const response = await authService.verifyMemberPasswordResetCode(resetEmail, resetCode);

    if (response.success) {
      setResetMessage(response.message || 'Code verified. Set your new password now.');
      setResetStep('setPassword');
    } else {
      setResetError(response.error || 'Invalid code. Please try again.');
    }

    setResetLoading(false);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setResetLoading(true);

    const response = await authService.confirmMemberPasswordReset(
      resetEmail,
      resetCode,
      resetNewPassword
    );

    if (response.success) {
      setResetMessage(response.message || 'Password updated successfully. You can now sign in.');
      setShowForgotPassword(false);
      resetState();
    } else {
      setResetError(response.error || 'Unable to reset the password. Please try again.');
    }

    setResetLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-secondary/60 dark:from-secondary/20 to-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-2xl p-8 shadow-lg animate-fade-in-up border border-border">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 mb-4">
              <img
                src="/photos/Logo.png"
                alt="Yunus Ahmed Lab logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Team Member Login</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Access your member dashboard
            </p>
          </div>

          {showForgotPassword ? (
            <div className="space-y-5">
              {resetStep === 'identify' && (
                <form onSubmit={handleVerifyIdentifier} className="space-y-5">
                  <div>
                    <label htmlFor="reset-identifier" className="block text-sm font-medium text-muted-foreground mb-2">
                      Username or Email
                    </label>
                    <input
                      id="reset-identifier"
                      type="text"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="john.doe or name@domain.edu"
                      required
                    />
                  </div>

                  {identifierError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                      {identifierError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={backToLogin}
                      className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={identifierLoading}
                      className="flex-1 py-3 bg-accent text-primary-foreground rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {identifierLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        'Continue'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {resetStep === 'chooseOption' && identifiedMember && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h2 className="text-lg font-semibold text-foreground">Choose verification option</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Account found for <strong>{identifiedMember.email}</strong>.
                      You can either receive a verification email or use a security code generated by an admin.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleSelectEmailReset}
                      className="py-3 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-secondary transition-colors"
                    >
                      Receive Email
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectSecurityCodeReset}
                      className="py-3 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-secondary transition-colors"
                    >
                      Enter Security Code
                    </button>
                  </div>

                  {resetError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                      {resetError}
                    </div>
                  )}

                  {resetMessage && (
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
                      {resetMessage}
                    </div>
                  )}
                </div>
              )}

              {resetStep === 'enterCode' && (
                <form onSubmit={handleVerifyResetCode} className="space-y-5">
                  <div>
                    <label htmlFor="reset-email-confirm" className="block text-sm font-medium text-muted-foreground mb-2">
                      Email
                    </label>
                    <input
                      id="reset-email-confirm"
                      type="email"
                      value={resetEmail}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground"
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="reset-code" className="block text-sm font-medium text-muted-foreground mb-2">
                      6-digit Code
                    </label>
                    <input
                      id="reset-code"
                      type="text"
                      inputMode="numeric"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </div>

                  {forgotPasswordOption === 'securityCode' && (
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm">
                      Ask the admin to generate the security code first. The code is valid for 30 minutes.
                    </div>
                  )}

                  {forgotPasswordOption === 'email' && (
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm">
                      Check your inbox for the verification code sent to {resetEmail}.
                    </div>
                  )}

                  {resetError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                      {resetError}
                    </div>
                  )}

                  {resetMessage && (
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
                      {resetMessage}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={backToLogin}
                      className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-3 bg-accent text-primary-foreground rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {resetStep === 'setPassword' && (
                <form onSubmit={handleConfirmResetPassword} className="space-y-5">
                  <div>
                    <label htmlFor="reset-email-confirm" className="block text-sm font-medium text-muted-foreground mb-2">
                      Email
                    </label>
                    <input
                      id="reset-email-confirm"
                      type="email"
                      value={resetEmail}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground"
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="reset-new-password" className="block text-sm font-medium text-muted-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="reset-new-password"
                        type={showResetNewPassword ? 'text' : 'password'}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
                      >
                        {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-muted-foreground mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="reset-confirm-password"
                        type={showResetConfirmPassword ? 'text' : 'password'}
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
                      >
                        {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {resetError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                      {resetError}
                    </div>
                  )}

                  {resetMessage && (
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
                      {resetMessage}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={backToLogin}
                      className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-3 bg-accent text-primary-foreground rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="john.doe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-accent text-primary-foreground rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Research group members only. Contact admin for access.
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
