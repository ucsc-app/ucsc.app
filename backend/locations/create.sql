DROP TABLE IF EXISTS class;
CREATE TABLE class (
	term INTEGER,
	classID INTEGER,

	pisaLink VARCHAR(300),
	name VARCHAR(200),
	instructor VARCHAR(100),

	parent INTEGER, -- a discussion section is just a class. if this field is null, its a class, otherwise
	                                 -- it points to the ID of the class its associated with

	PRIMARY KEY (term, classID)
	-- FOREIGN KEY (discussionSectionParent) REFERENCES class(id)
);

DROP TABLE IF EXISTS location;
CREATE TABLE location (
	locationID INTEGER PRIMARY KEY,
	building VARCHAR(30),
	room VARCHAR(10),

	UNIQUE (building, room)
);

DROP TABLE IF EXISTS timeBlock;
CREATE TABLE timeBlock (
	blockID   INTEGER PRIMARY KEY,
	day       TINYINT NOT NULL,      -- 0 mon, 1 tues, etc
	startTime TIME NOT NULL,
	endTime   TIME NOT NULL,

	UNIQUE (day, startTime, endTime)
);

-- join tables

DROP TABLE IF EXISTS classLocationTimeBlock;
CREATE TABLE classLocationTimeBlock (
	term INTEGER,
	classID INTEGER,
	
	locationID INTEGER,

	blockID INTEGER,

	FOREIGN KEY (term, classID) REFERENCES class(term, classID),
	FOREIGN KEY (locationID) REFERENCES location(locationID),
	FOREIGN KEY (blockID) REFERENCES timeBlock(blockID),

	-- discussion sections can be shared between classes (eg phys 6A 01 and 02 fall 2004 share sections)
	-- when the sections for both classes get parsed, duplicate rows will be inserted here
	-- hence why i added the unique constraint here
	UNIQUE(term, classID, locationID, blockID)
);