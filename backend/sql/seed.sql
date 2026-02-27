CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  question TEXT NOT NULL,
  table_names TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL
);

TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;
TRUNCATE TABLE assignments RESTART IDENTITY CASCADE;

INSERT INTO customers (name, city) VALUES
('Asha', 'Delhi'),
('Ravi', 'Mumbai'),
('Neha', 'Bangalore'),
('Imran', 'Delhi');

INSERT INTO orders (customer_id, amount, status) VALUES
(1, 1200.00, 'completed'),
(1, 350.50, 'pending'),
(2, 799.00, 'completed'),
(3, 150.00, 'cancelled'),
(4, 500.00, 'completed');

INSERT INTO assignments (title, description, difficulty, question, table_names) VALUES
(
  'Customers with Completed Orders',
  'Practice JOIN and filtering.',
  'Easy',
  'List customer names and order amounts for completed orders only. Show customer_name and amount.',
  ARRAY['customers', 'orders']
),
(
  'City-wise Revenue',
  'Practice aggregation and grouping.',
  'Medium',
  'Calculate total completed order revenue per city. Show city and total_revenue sorted by total_revenue desc.',
  ARRAY['customers', 'orders']
);
