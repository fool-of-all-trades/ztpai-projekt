delete from quotes
where author = 'Storyline'
  and source = 'Seed quote';

insert into quotes (text, author, source) values
    ('It was a bright cold day in April, and the clocks were striking thirteen.', 'George Orwell', 'Nineteen Eighty-Four'),
    ('Call me Ishmael.', 'Herman Melville', 'Moby-Dick'),
    ('All this happened, more or less.', 'Kurt Vonnegut', 'Slaughterhouse-Five'),
    ('It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.', 'Jane Austen', 'Pride and Prejudice'),
    ('All happy families are alike; each unhappy family is unhappy in its own way.', 'Leo Tolstoy', 'Anna Karenina'),
    ('It was the best of times, it was the worst of times.', 'Charles Dickens', 'A Tale of Two Cities'),
    ('In a hole in the ground there lived a hobbit.', 'J.R.R. Tolkien', 'The Hobbit'),
    ('The man in black fled across the desert, and the gunslinger followed.', 'Stephen King', 'The Gunslinger'),
    ('The sky above the port was the color of television, tuned to a dead channel.', 'William Gibson', 'Neuromancer'),
    ('We were somewhere around Barstow on the edge of the desert when the drugs began to take hold.', 'Hunter S. Thompson', 'Fear and Loathing in Las Vegas'),
    ('The past is a foreign country: they do things differently there.', 'L. P. Hartley', 'The Go-Between'),
    ('Mother died today.', 'Albert Camus', 'The Stranger'),
    ('There was a boy called Eustace Clarence Scrubb, and he almost deserved it.', 'C. S. Lewis', 'The Voyage of the Dawn Treader'),
    ('I write this sitting in the kitchen sink.', 'Dodie Smith', 'I Capture the Castle'),
    ('It was love at first sight.', 'Joseph Heller', 'Catch-22'),
    ('The sun shone, having no alternative, on the nothing new.', 'Samuel Beckett', 'Murphy'),
    ('I am an invisible man.', 'Ralph Ellison', 'Invisible Man'),
    ('Ships at a distance have every man''s wish on board.', 'Zora Neale Hurston', 'Their Eyes Were Watching God'),
    ('There is grandeur in this view of life.', 'Charles Darwin', 'On the Origin of Species'),
    ('The cold passed reluctantly from the earth, and the retiring fogs revealed an army stretched out on the hills, resting.', 'Stephen Crane', 'The Red Badge of Courage'),
    ('All children, except one, grow up.', 'J. M. Barrie', 'Peter Pan'),
    ('It was a pleasure to burn.', 'Ray Bradbury', 'Fahrenheit 451'),
    ('The last man on Earth sat alone in a room.', 'Fredric Brown', 'Knock');
