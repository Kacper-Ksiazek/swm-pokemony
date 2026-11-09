CREATE TABLE `map_pin` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pokemon_id` integer NOT NULL,
	`name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL
);
