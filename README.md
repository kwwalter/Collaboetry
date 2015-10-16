# Project Two - Kevin Walter: Collaboetry

## a collaborative, wiki-type thing for writers

When my friends and I have new work that we want to share with each other, we usually email attachments, which is lame an inefficient. It's impossible to keep track of versions, and there's no way to keep a record of our comments. With this app, I've tried to create a functional and fun place for friends to share their writing with one another.  

### Technology Used

For this app, I used:
* HTML5 for my basic, underlying structure
* CSS3 for styling
* Javascript and jQuery
* node.js and Express
* mongoose / MongoDB

### Approach

I started by creating a very crude diagram showing how the various views would be interacting with the database collections, and then did a rough sketch of what each page would look like. I decided on a format for the header, and used express-ejs-layouts to create the boilerplate for how I wanted the basic scaffolding of the site to look like.

Then, I got started with setting up all of the dependencies I'd need for the app to run, and created the basic file structure for the app. I started to create the individual files I'd need. Then, I went on Google Fonts and found some jazzy fonts to use, downloaded those, and saved the font-faces to the CSS.

I started to do some work on the preliminary routes at this point, but turned my attention back to fonts and styles first. I really wanted to have a decent idea of what the site would look like before I started mucking around too much.

The next day I watched another of Shorty's video series on creating a CRUD app, and saw the MVC file architecture he was working with and realized that would make my life at least 11% easier, so I reorganized all of my stuff according to those principles. It was a bit tricky at first, since this is the first time I've done that, but ultimately it didn't take up too much time.

Next, I started to set up the controllers for poems and for users, and required each of those in my `server.js`. I had some difficulty getting the routes to work correctly, but worked my way through it. I also started working on incorporating user login / log out at this point, which turned out to be a lot easier than expected. I didn't have time to incorporate bcrpyt into my app, but that's something I defintely want to do in the near future.

To finally get the ball rolling on the CRUD aspects of the app, I tackled the post/poem submission form next. I wrestled with the formatting of this page a lot (actually, I did this for most of my formatting--I didn't want to leave it all until the very end), and then finally got the poems to save to the database. Hooray!

Then, of course, I took care of the most important part of the app: adding the favicon.

I then spent a good amount of time with manipulating the poem data in the database, and rendering the author view page accordingly. It was a struggle at times, but I worked my way through each of the routes, one by one. This was really a learning experience for me as far as mongoose / MongoDB is concerned--I learned a ton on how to access and update data in two separate collections, and plan on incorporating some `.populate()` in future versions, once I have more time to play around with it.

After I finally got the edit route working, I turned my attention to delete, which I thought would be easier. It was, to some extent, but I didn't realize how difficult it would be to delete one particular version of a poem once it was archived in the `previousVersions` array within the Poem model. I did some serious google / stack overflow sleuthing and eventually answered the question, but I still think there's a more optimal way to perform some of these find and update operations.

I then worked on the home page, so that it shows all of the poems that the current user has posted, and will show how many people have responded to each poem. The user can click on the poem itself to access the most recent version, or can click on the number of edits to see the full version history.

Realizing that my app was sort of monotone, I added a few `:hover` background-color changes to jazz things up a bit, and then played with the formatting a bit more.

I then worked on a few things that I saved until the very end, mostly because I thought they'd be easier. There was some truth to that. I ensured that usernames and emails were unique, corrected the layout on the login/signup pages, and added media queries (both for smaller screen sizes AND for a print-optimized version, so that a user can print out a poem if they so choose). I tested everything on heroku to see how it worked, and then added my little github link in the bottom righthand corner of the app.

A ton of work thus far, but a ton more to go..

### Installation Instructions

You can use Collaboetry [here](https://mysterious-island-7822.herokuapp.com/).

### Unsolved Problems / Things to Include on Future Versions
* Would like to make a scripts folder in public to hold jQuery Scripts
* Voting system to ratify all changes--but this may be a project unto itself
* bcrpyt for passwords
* user password resets
* use flash messages to confirm delete of a poem or a version
* use HTML5 to to capture user audio of them reading their work
* snippets section (available only to the logged in user) where they can keep notes for future poems
* figure out issue with rendering the signout page, instead of just redirecting to login view on signout
* use populate to better organize version content and comments
* push notifications to alert users when new poems have been posted, or when someone has commented / edited one of theirs

### Wireframe Images / User Stories / Notes

![Wireframe](https://github.com/kwwalter/Collaboetry/blob/master/wireframes/IMAG2481.jpg)

![Wireframe](https://github.com/kwwalter/Collaboetry/blob/master/wireframes/IMAG2483.jpg)

![Notes](https://github.com/kwwalter/Collaboetry/blob/master/wireframes/IMAG2485.jpg)

![Notes](https://github.com/kwwalter/Collaboetry/blob/master/wireframes/IMAG2484.jpg)

![Wireframe](https://github.com/kwwalter/Collaboetry/blob/master/wireframes/IMAG2486.jpg)

### Attributions

Many thanks to my teachers at GA (Shorty, Huntington, Kristyn, and Greg) for all the help and support.

And of course, to my fellow classmates for helping answer my questions, and for being great to talk to during this crazy, frantic period of app development. Special shout-out to the back row.

I didn't use that much from other people, but here are some elements I borrowed:

* AmaticSC-Bold, AmaticSC-Regular, and OpenSans-CondLight fonts: https://www.google.com/fonts
* Quill pen favicon!: http://www.favicon.cc/?action=icon&file_id=587903
* GitHub octocat logo: https://github.com/logos

Thanks to all!
