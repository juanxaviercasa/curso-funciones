-- Separa compras reales de pruebas. Los registros existentes son sandbox.
ALTER TABLE orders ADD COLUMN payment_environment TEXT NOT NULL DEFAULT 'sandbox' CHECK(payment_environment IN ('sandbox','production'));
