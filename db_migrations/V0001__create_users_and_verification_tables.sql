CREATE TABLE IF NOT EXISTS t_p64378712_movie_ticket_system.users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p64378712_movie_ticket_system.verification_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_codes_phone ON t_p64378712_movie_ticket_system.verification_codes(phone);
CREATE INDEX idx_verification_codes_expires ON t_p64378712_movie_ticket_system.verification_codes(expires_at);