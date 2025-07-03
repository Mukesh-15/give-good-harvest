
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Mail, Shield, Key } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Step = 'email' | 'otp' | 'password';

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message);
      }

      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message);
      }

      setResetToken(data.resetToken);
      toast({
        title: "OTP Verified",
        description: "Now you can set your new password",
      });
      setStep('password');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message);
      }

      toast({
        title: "Success",
        description: "Password reset successfully. You can now login with your new password.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP}>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Verification Code"}
        </Button>
        <Link to="/login" className="text-sm text-center text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </CardFooter>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP}>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
        </div>
        <div className="space-y-2">
          <Label>Verification Code</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep('email')}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Didn't receive the code? Send again
          </button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button className="w-full" type="submit" disabled={isLoading || otp.length !== 6}>
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-sm text-center text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Change Email
        </button>
      </CardFooter>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleResetPassword}>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Create a new password for your account.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input 
            id="newPassword" 
            type="password" 
            placeholder="Enter new password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="Confirm new password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </CardFooter>
    </form>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Forgot Password';
      case 'otp': return 'Verify Code';
      case 'password': return 'Reset Password';
      default: return 'Forgot Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email': return 'Enter your email to receive a verification code';
      case 'otp': return 'Enter the verification code sent to your email';
      case 'password': return 'Create a new password for your account';
      default: return '';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        
        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOTPStep()}
        {step === 'password' && renderPasswordStep()}
      </Card>
    </div>
  );
};

export default ForgotPassword;
