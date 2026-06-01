<img width="737" height="634" alt="image" src="https://github.com/user-attachments/assets/eaf44c1c-ad73-4e76-bc44-b9a3c0b291b3" />

A class is uniquely identified by its ID and its term (since the same ID can be reused across terms). A class will have a link to its Pisa page, a name, an instructor, and a null parent field.

A discussion section is a class with its own unique ID and term. It has a null Pisa link, its name will be something like "DISC-01A" or "LBS-02D" or something, an instructor (usually "Staff" but sometimes a name), and a non-null parent field pointing to its "parent" class. 

When a query is run to get the schedule for a location, it makes two queries. 

* The first one simply joins all tables, and gets the name/link/instructor for all regular classes (all entries in the `class` table with a null parent). 
* The second query joins the `class` table with itself on the `parent` field and gets all discussion sections in that location. A discussion section's Pisa link will just be the Pisa link of its parent, and its name will be its own name combined with the name of its parent (eg "DISC-01A for CSE 101 - Data Structs & Algs"). 

Then it just takes the union of these two and sorts by start time to get the schedule for a room.


#### why is time block its own table?

Let's assume for a moment that classes can only meet at the same time on unique days (eg TuTh, MWF, etc.). If that was the case, I could just have `WHERE day LIKE '%W%'` to get all classes that took place on Wednesdays. However, this is not the case. For instance, take a look at [CRSN-1 from Fall 2022](https://pisa.ucsc.edu/class_search/index.php?action=detail&class_data=YToyOntzOjU6IjpTVFJNIjtzOjQ6IjIyMjgiO3M6MTA6IjpDTEFTU19OQlIiO3M6NToiMTIyMTYiO30=). Doing `WHERE day LIKE '%M%'` would not distinguish between the 4-5:05pm meeting in RCC Acad 250 or the 7:10-8:45pm meeting in Classroom Unit 002. Thus, it makes more sense to split time blocks into its own table. After the class gets processed and the tables are joined and you filter by Monday, it would look something like this: 

| Class    | Day     | Start Time | End Time  | Location           |
| -------- | ------- | ---------- | --------- | ------------------ |
| CRSN-1   | M       | 16:00:00   | 17:05:00  | R Carson Acad 250  |
| CRSN-1   | M       | 19:10:00   | 20:45:00  | Classroom Unit 002 |


#### some other notes

So the idea is that `pisadownloader.py` runs once and makes API calls to UCSC's backend class API for every single class between now and Fall 2004 and stores its response as a binary file for each term. Then `locationscraper.py` will go through each binary file in `/compressed`, process each API response and transform it however it needs to and stick it into the database (with some utility stuff in `loctypes.py` and `readbin.py`). Then, periodically, `pisadownloader.py` will wake up and check if theres a new term available, and if so, download its class data too. 

Note that `locationscraper.py` does not care about which term is the latest term, it just processes every single binary file it sees in `/compressed`. That way, `pisadownloader.py` can periodically add to this folder without having to update anything within `locationscraper.py`.
