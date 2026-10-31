ALTER TABLE orders ADD COLUMN checkout_key TEXT;
ALTER TABLE orders ADD COLUMN provider_order_id TEXT;
CREATE UNIQUE INDEX orders_checkout_key ON orders(user_id,checkout_key);
CREATE UNIQUE INDEX orders_provider_order ON orders(provider_order_id);
