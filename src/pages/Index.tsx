import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import AuthModal from '@/components/AuthModal';
import ProfileModal from '@/components/ProfileModal';

const Index = () => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [user, setUser] = useState<{ id: number; phone: string; name: string | null } | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const ORDERS_API = 'https://functions.poehali.dev/dfffafd3-1730-44a3-a8d2-53828b391cc0';

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('session_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setSessionToken(savedToken);
    }
  }, []);

  const showtimes = [
    { time: '12:00', available: true },
    { time: '15:30', available: true },
    { time: '18:00', available: true },
    { time: '21:00', available: true },
    { time: '23:30', available: false },
  ];

  const handleAuthSuccess = (userData: { id: number; phone: string; name: string | null }, token: string) => {
    setUser(userData);
    setSessionToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('session_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    toast.success('Вы вышли из аккаунта');
  };

  const handleBuyTicket = async () => {
    if (!user || !sessionToken) {
      setAuthModalOpen(true);
      toast.error('Войдите в аккаунт для покупки билета');
      return;
    }
    if (!selectedTime) {
      toast.error('Выберите время сеанса');
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error('Выберите места в зале');
      return;
    }

    try {
      const response = await fetch(ORDERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken,
        },
        body: JSON.stringify({
          movie_title: 'Мотоцикл в окне 1',
          showtime: selectedTime,
          show_date: '2026-01-01',
          seats: selectedSeats,
          ticket_count: ticketCount,
          total_price: ticketCount * 500,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Вы успешно купили ${ticketCount} ${ticketCount === 1 ? 'билет' : 'билета'}! Места: ${selectedSeats.join(', ')}. Ждите 1 часть в Январе 2026 года`, {
          duration: 5000,
        });
        setSelectedSeats([]);
        setTicketCount(1);
      } else {
        toast.error('Ошибка при оформлении заказа');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    }
  };

  const toggleSeat = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      setTicketCount(Math.max(1, ticketCount - 1));
    } else if (selectedSeats.length < ticketCount) {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 10;
    const seats = [];
    const occupiedSeats = [3, 7, 15, 22, 28, 31, 44];
    
    let seatNumber = 1;
    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        seats.push({
          number: seatNumber,
          row,
          seat: i,
          occupied: occupiedSeats.includes(seatNumber),
        });
        seatNumber++;
      }
    }
    return seats;
  };

  const seats = generateSeats();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Film" className="text-primary" size={28} />
              <span className="text-2xl font-bold">Кинотеатр Рубин</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex gap-6">
                <a href="#hero" className="hover:text-primary transition-colors">Главная</a>
                <a href="#showtimes" className="hover:text-primary transition-colors">Расписание</a>
                <a href="#tickets" className="hover:text-primary transition-colors">Билеты</a>
                <a href="#about" className="hover:text-primary transition-colors">О фильме</a>
              </div>
              {user ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setProfileModalOpen(true)}
                    className="hidden md:flex"
                  >
                    <Icon name="User" size={16} className="mr-1" />
                    {user.name || 'Гость'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setProfileModalOpen(true)}
                    className="md:hidden"
                  >
                    <Icon name="User" size={20} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <Icon name="LogOut" size={16} className="md:mr-1" />
                    <span className="hidden md:inline">Выйти</span>
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={() => setAuthModalOpen(true)} className="cinema-glow">
                  <Icon name="LogIn" size={16} className="mr-1" />
                  Вход
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-background z-10" />
        <img
          src="https://cdn.poehali.dev/projects/7b0beb58-732d-46ed-823c-9c3d47f8cb18/files/af845dec-89c4-4c16-875b-ad699d182454.jpg"
          alt="Мотоцикл в окне 1"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        
        <div className="relative z-20 container mx-auto px-4 text-center">
          <Badge className="mb-6 text-lg px-6 py-2 bg-primary/20 border-2 border-primary cinema-glow">
            Премьера 2026
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-shadow-glow">
            МОТОЦИКЛ В ОКНЕ
          </h1>
          <div className="inline-block bg-secondary text-secondary-foreground px-8 py-3 text-5xl font-bold mb-8 gold-glow">
            ЧАСТЬ 1
          </div>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto font-light">
            Загадочная история, которая перевернет ваше представление о реальности
          </p>
          <div className="flex items-center justify-center gap-4 text-lg mb-12">
            <div className="flex items-center gap-2">
              <Icon name="MapPin" className="text-primary" size={24} />
              <span>Кинотеатр Рубин</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Icon name="Calendar" className="text-secondary" size={24} />
              <span className="font-semibold text-secondary">1 января 2026</span>
            </div>
          </div>
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 cinema-glow hover:scale-105 transition-transform"
            onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Icon name="Ticket" className="mr-2" size={24} />
            Купить билет
          </Button>
        </div>
      </section>

      <section id="showtimes" className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 text-shadow-glow">Расписание сеансов</h2>
            <p className="text-muted-foreground text-lg">Кинотеатр Рубин • 1 января 2026</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {showtimes.map((showtime) => (
              <Card
                key={showtime.time}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedTime === showtime.time
                    ? 'border-primary cinema-glow bg-primary/10'
                    : 'border-border bg-card'
                } ${!showtime.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => showtime.available && setSelectedTime(showtime.time)}
              >
                <CardContent className="p-6 text-center">
                  <Icon name="Clock" className="mx-auto mb-3 text-primary" size={32} />
                  <div className="text-3xl font-bold mb-2">{showtime.time}</div>
                  <Badge variant={showtime.available ? 'default' : 'secondary'} className="text-xs">
                    {showtime.available ? 'Доступно' : 'Продано'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="tickets" className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-2 border-primary/30 cinema-glow">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <Icon name="Ticket" className="mx-auto mb-4 text-primary" size={64} />
                <h2 className="text-4xl font-bold mb-2">Покупка билета</h2>
                <p className="text-muted-foreground">Выберите время сеанса</p>
              </div>

              {selectedTime && (
                <>
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-3">Количество билетов</label>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newCount = Math.max(1, ticketCount - 1);
                          setTicketCount(newCount);
                          if (selectedSeats.length > newCount) {
                            setSelectedSeats(selectedSeats.slice(0, newCount));
                          }
                        }}
                        disabled={ticketCount <= 1}
                      >
                        <Icon name="Minus" size={20} />
                      </Button>
                      <span className="text-3xl font-bold w-16 text-center">{ticketCount}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTicketCount(Math.min(6, ticketCount + 1))}
                        disabled={ticketCount >= 6}
                      >
                        <Icon name="Plus" size={20} />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-3 text-center">
                      Выберите места ({selectedSeats.length}/{ticketCount})
                    </label>
                    <div className="bg-muted/30 rounded-lg p-6">
                      <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-b from-muted to-muted/50 px-12 py-2 rounded text-sm font-semibold">
                          ЭКРАН
                        </div>
                      </div>
                      <div className="space-y-2">
                        {['A', 'B', 'C', 'D', 'E'].map((row) => (
                          <div key={row} className="flex items-center justify-center gap-2">
                            <span className="text-xs font-bold w-6 text-muted-foreground">{row}</span>
                            {seats
                              .filter((s) => s.row === row)
                              .map((seat) => (
                                <button
                                  key={seat.number}
                                  onClick={() => !seat.occupied && toggleSeat(seat.number)}
                                  disabled={seat.occupied || (selectedSeats.length >= ticketCount && !selectedSeats.includes(seat.number))}
                                  className={`w-8 h-8 rounded-t-lg text-xs font-semibold transition-all ${
                                    seat.occupied
                                      ? 'bg-muted/50 cursor-not-allowed'
                                      : selectedSeats.includes(seat.number)
                                      ? 'bg-primary text-primary-foreground scale-110 cinema-glow'
                                      : 'bg-card border border-border hover:bg-primary/20 hover:scale-105'
                                  } disabled:opacity-30`}
                                  title={`Место ${seat.number}`}
                                >
                                  {seat.seat}
                                </button>
                              ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-6 mt-6 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-card border border-border rounded-t-lg" />
                          <span>Свободно</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-t-lg" />
                          <span>Выбрано</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-muted/50 rounded-t-lg" />
                          <span>Занято</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Фильм</span>
                      <span className="font-semibold">Мотоцикл в окне 1</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Время</span>
                      <span className="font-semibold text-primary">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Дата</span>
                      <span className="font-semibold text-secondary">1 января 2026</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Билеты</span>
                      <span className="font-semibold">{ticketCount} × 500 ₽</span>
                    </div>
                    {selectedSeats.length > 0 && (
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-muted-foreground">Места</span>
                        <span className="font-semibold">{selectedSeats.join(', ')}</span>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Итого</span>
                      <span className="text-2xl font-bold text-primary">{ticketCount * 500} ₽</span>
                    </div>
                  </div>
                </>
              )}

              <Button
                size="lg"
                className="w-full text-xl py-8 cinema-glow"
                onClick={handleBuyTicket}
                disabled={!selectedTime || selectedSeats.length === 0}
              >
                <Icon name="ShoppingCart" className="mr-2" size={24} />
                Купить {ticketCount === 1 ? 'билет' : `${ticketCount} билета`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="about" className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-12 text-center text-shadow-glow">О фильме</h2>
            
            <Card className="mb-8 border-border">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="BookOpen" className="text-primary" size={28} />
                  Сюжет
                </h3>
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  Мистический триллер о городском художнике, который каждую ночь видит в окне своей квартиры 
                  старинный мотоцикл. Но когда он пытается сфотографировать его, изображение исчезает. 
                  Постепенно герой начинает понимать, что мотоцикл — это не просто видение, а портал в другое измерение, 
                  где его ждут невероятные открытия и смертельные опасности.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Первая часть трилогии погрузит зрителей в атмосферу загадок, где реальность переплетается с фантазией, 
                  а каждое решение может изменить судьбу главного героя навсегда.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon name="Film" className="text-primary" size={24} />
                    Детали фильма
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Жанр</span>
                      <span className="font-semibold">Мистика, Триллер</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Длительность</span>
                      <span className="font-semibold">142 минуты</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Возраст</span>
                      <span className="font-semibold">16+</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Формат</span>
                      <span className="font-semibold">IMAX, 3D</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon name="MapPin" className="text-secondary" size={24} />
                    Кинотеатр Рубин
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Icon name="MapPin" className="text-muted-foreground mt-1" size={20} />
                      <div>
                        <p className="font-semibold mb-1">Адрес</p>
                        <p className="text-muted-foreground">ул. Театральная, 15</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Icon name="Phone" className="text-muted-foreground mt-1" size={20} />
                      <div>
                        <p className="font-semibold mb-1">Телефон</p>
                        <p className="text-muted-foreground">+7 (495) 123-45-67</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Icon name="Clock" className="text-muted-foreground mt-1" size={20} />
                      <div>
                        <p className="font-semibold mb-1">Режим работы</p>
                        <p className="text-muted-foreground">Ежедневно 10:00 - 02:00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Film" className="text-primary" size={32} />
            <span className="text-2xl font-bold">Кинотеатр Рубин</span>
          </div>
          <p className="text-muted-foreground mb-6">
            Премьера «Мотоцикл в окне 1» • 1 января 2026
          </p>
          <div className="flex justify-center gap-6">
            <Icon name="Instagram" className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" size={24} />
            <Icon name="Facebook" className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" size={24} />
            <Icon name="Twitter" className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" size={24} />
          </div>
        </div>
      </footer>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        onAuthSuccess={handleAuthSuccess}
      />

      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        user={user}
        sessionToken={sessionToken}
      />
    </div>
  );
};

export default Index;