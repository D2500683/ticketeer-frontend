import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_CONFIG } from '@/config/api';

const ConfirmEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link.');
        return;
      }

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/confirm/${token}`, {
          method: 'GET',
        });

        const text = await response.text();

        if (response.ok) {
          if (text.includes('already confirmed')) {
            setStatus('already_confirmed');
            setMessage('Your email is already confirmed. You can log in now.');
          } else {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now log in.');
          }
        } else {
          setStatus('error');
          setMessage('Invalid or expired confirmation link.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    confirmEmail();
  }, [token]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
      case 'already_confirmed':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirming Your Email...';
      case 'success':
        return 'Email Confirmed!';
      case 'already_confirmed':
        return 'Already Confirmed';
      case 'error':
        return 'Confirmation Failed';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {message}
          </p>
          
          {(status === 'success' || status === 'already_confirmed') && (
            <Button 
              onClick={handleLoginRedirect}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              Go to Login
            </Button>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={handleLoginRedirect}
                variant="outline"
                className="w-full"
              >
                Go to Login
              </Button>
              <p className="text-sm text-muted-foreground">
                If you need a new confirmation link, please contact support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmail;
