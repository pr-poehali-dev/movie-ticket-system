import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Order {
  id: number;
  movie_title: string;
  showtime: string;
  show_date: string;
  seats: string;
  ticket_count: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: number; phone: string; name: string | null } | null;
  sessionToken: string | null;
}

const ProfileModal = ({ open, onOpenChange, user, sessionToken }: ProfileModalProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const ORDERS_API = 'https://functions.poehali.dev/dfffafd3-1730-44a3-a8d2-53828b391cc0';

  useEffect(() => {
    if (open && sessionToken) {
      loadOrders();
    }
  }, [open, sessionToken]);

  const loadOrders = async () => {
    if (!sessionToken) return;

    setLoading(true);
    try {
      const response = await fetch(ORDERS_API, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken,
        },
      });

      const data = await response.json();

      if (response.ok && data.orders) {
        setOrders(data.orders);
      } else {
        toast.error('Ошибка загрузки заказов');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon name="User" className="text-primary" size={28} />
            Личный кабинет
          </DialogTitle>
        </DialogHeader>

        {user && (
          <div className="space-y-6">
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-4">
                    <Icon name="User" className="text-primary" size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{user.name || 'Гость'}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Phone" size={16} />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="ShoppingBag" className="text-primary" size={24} />
                  История покупок
                </h3>
                <Button variant="ghost" size="sm" onClick={loadOrders} disabled={loading}>
                  <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Icon name="Loader2" className="animate-spin mx-auto mb-3 text-primary" size={40} />
                  <p className="text-muted-foreground">Загрузка заказов...</p>
                </div>
              ) : orders.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Icon name="ShoppingBag" className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <p className="text-lg text-muted-foreground mb-2">
                      У вас пока нет покупок
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Забронируйте билеты на премьеру!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon name="Film" className="text-primary" size={20} />
                              <h4 className="font-bold text-lg">{order.movie_title}</h4>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Icon name="Calendar" size={14} />
                                <span>{formatDate(order.show_date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="Clock" size={14} />
                                <span>{order.showtime}</span>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={order.status === 'confirmed' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {order.status === 'confirmed' ? 'Подтверждено' : order.status}
                          </Badge>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Билеты</p>
                            <p className="font-semibold">{order.ticket_count} шт.</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Места</p>
                            <p className="font-semibold">{order.seats}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Сумма</p>
                            <p className="font-bold text-primary">{order.total_price} ₽</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Icon name="Clock" size={12} />
                            Куплено: {formatDateTime(order.created_at)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
