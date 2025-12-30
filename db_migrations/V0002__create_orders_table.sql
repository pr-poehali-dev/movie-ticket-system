CREATE TABLE IF NOT EXISTS t_p64378712_movie_ticket_system.orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_title VARCHAR(255) NOT NULL,
    showtime VARCHAR(10) NOT NULL,
    show_date DATE NOT NULL,
    seats TEXT NOT NULL,
    ticket_count INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_p64378712_movie_ticket_system.users(id)
);

CREATE INDEX idx_orders_user_id ON t_p64378712_movie_ticket_system.orders(user_id);
CREATE INDEX idx_orders_created_at ON t_p64378712_movie_ticket_system.orders(created_at DESC);