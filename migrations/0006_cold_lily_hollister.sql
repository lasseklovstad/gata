-- Create the trigger to delete orphaned messages
CREATE TRIGGER delete_orphan_event_message
AFTER DELETE ON event_messages
FOR EACH ROW
BEGIN
    DELETE FROM messages
    WHERE id = OLD.message_id;
END;
--> statement-breakpoint
CREATE TRIGGER delete_orphan_message_replies
AFTER DELETE ON message_replies
FOR EACH ROW
BEGIN
    DELETE FROM messages
    WHERE id = OLD.reply_id;
END;