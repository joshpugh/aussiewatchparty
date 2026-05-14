CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`opponent` text NOT NULL,
	`stage` text NOT NULL,
	`kickoff_utc` integer NOT NULL,
	`venue_city` text,
	`venue_country` text,
	`notes` text,
	`is_tbd` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `parties` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`match_id` text NOT NULL,
	`venue_name` text NOT NULL,
	`venue_logo_url` text,
	`address_line` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`zip` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`host_notes` text,
	`capacity` integer,
	`contact_email` text,
	`website_url` text,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parties_slug_idx` ON `parties` (`slug`);--> statement-breakpoint
CREATE INDEX `parties_match_idx` ON `parties` (`match_id`);--> statement-breakpoint
CREATE INDEX `parties_state_idx` ON `parties` (`state`);--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`party_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`party_size` integer DEFAULT 1 NOT NULL,
	`consent` integer NOT NULL,
	`confirmation_sent_at` integer,
	`reminder_sent_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `rsvps_party_idx` ON `rsvps` (`party_id`);--> statement-breakpoint
CREATE INDEX `rsvps_email_idx` ON `rsvps` (`email`);--> statement-breakpoint
CREATE TABLE `zip_centroids` (
	`zip` text PRIMARY KEY NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`city` text,
	`state` text
);
