import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: { id: number; phone: string; name: string | null }, token: string) => void;
}

const AuthModal = ({ open, onOpenChange, onAuthSuccess }: AuthModalProps) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const API_URL = 'https://functions.poehali.dev/8ea29647-df1f-4b6f-a43d-23016d262ee7';

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_code', phone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDevCode(data.dev_code);
        setStep('code');
        toast.success('Код отправлен!', {
          description: `Демо-режим: ваш код ${data.dev_code}`,
          duration: 10000,
        });
      } else {
        toast.error(data.error || 'Ошибка отправки кода');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error('Введите 6-значный код');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_code', phone, code, name }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Вы успешно вошли!');
        onAuthSuccess(data.user, data.session_token);
        onOpenChange(false);
        setStep('phone');
        setPhone('');
        setCode('');
        setName('');
        setDevCode(null);
      } else {
        toast.error(data.error || 'Неверный код');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="LogIn" className="text-primary" size={28} />
            {step === 'phone' ? 'Вход в аккаунт' : 'Подтверждение'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' 
              ? 'Введите номер телефона для входа или регистрации' 
              : 'Введите код из SMS'}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 999 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button 
              onClick={handleSendCode} 
              disabled={loading} 
              className="w-full cinema-glow"
              size="lg"
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </Button>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            {devCode && (
              <div className="bg-primary/10 border border-primary rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Демо-режим</p>
                <p className="text-2xl font-bold text-primary">{devCode}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="code">Код из SMS</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="mt-2 text-center text-2xl tracking-widest"
              />
            </div>

            <div>
              <Label htmlFor="name">Ваше имя (необязательно)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setDevCode(null);
                }} 
                variant="outline"
                className="flex-1"
              >
                Назад
              </Button>
              <Button 
                onClick={handleVerifyCode} 
                disabled={loading} 
                className="flex-1 cinema-glow"
              >
                {loading ? 'Проверка...' : 'Войти'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
