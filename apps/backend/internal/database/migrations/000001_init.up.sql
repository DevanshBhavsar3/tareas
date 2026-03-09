CREATE OR REPLACE FUNCTION trigger_set_update_at()
RETURNS TRIGGER as $$
BEGIN
    New.update_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;
