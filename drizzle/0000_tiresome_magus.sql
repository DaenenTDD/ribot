CREATE TABLE `voice_stats` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`time_in_voice` integer DEFAULT 0 NOT NULL,
	`time_deafened` integer DEFAULT 0 NOT NULL,
	`time_muted` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
