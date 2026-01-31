# Art Heist - Development Prompts

## Prompt 1
You are going to create a browser-based game called 'art heist' in which you score points of each artwork that you manage to pass. The starting format will be a 2D screen where the aim is to get from the left edge of the screen to the right, while collecting artworks, and avoiding security guards.

Both artworks and security guards show up as small icons on the screen, randomly scattered. Your path shows up as a line, which will zigzag between these obstacles: the default direction will be 45 degrees pointing downwards, but if you press and hold the space bar it will switch to 45 degrees upwards until you release it.

Let's start with the core game mechanic: make a screen with five randomly placed security guards, and the line that will travel across the screen and respond to me pressing or releasing the space bar.

## Prompt 2
1 wrap around; 2 permanent trail; 3 random 4 emoji; 5 game ends if I hit a guard, otherwise on to the next screen with more guards (but can just be the same 5 guards for this first version)

## Prompt 3
From now on, append every prompt that I give you to a markdown file: prompts.md

## Prompt 4
Moow make it more difficult by adding more guards each time you complete a level

## Prompt 5
Now we need to ad some artworks. I want to get thumbnail images from the Art Institute of Chicago's API (docs at https://api.artic.edu/docs/), which can provide small images using the IIIF Image API. Design an API call to get 100 random image URLs. Note that they MUST be in the public domain ([is_public_domain]=true).

## Prompt 6
Now use those API requests to get some artwork thumbnails and scatter them around the playing area too.

## Prompt 7
Limit the page paramter to a maximum of 10, otherwise the API responds with an error: {
"status": 403,
"error": "Invalid number of results",
"detail": "You have requested too many results. Please refine your parameters."
}

## Prompt 8
This is working but the image requests are coming back as 403 because of CORS restrictions. Write a local proxy to retrieve these.

## Prompt 9
Use vite to serve everything so that the proxy works

## Prompt 10
I'd like to show some more information about each artwork as I steal it. What are some interesting fields that I can get from the API?

## Prompt 11
You choose. Then display them briefly each time a work gets stolen

## Prompt 12
Give me some ideas for how to make it more fun

## Prompt 13
I like the idea of each level having artworks of a different art theme (style_title field?) display the theme that is being used on each level, make sure the artworks are all from that theme, and then change it to a different one as the thief moves to the next level

## Prompt 14
Now add a finish screen that lists all of the artworks that you have stolen, with nice big thumbnails and similar details to each toast

## Prompt 15
Make each guard move a bit, but not so much that it becomes too hard to play

## Prompt 16
Generate a README.md with instructions for running all this locally

## Prompt 17
Add a nice visual effect when each artwork is collected

## Prompt 18
add a sound effect too

## Prompt 19
add a sound when you get caught

## Prompt 20
add a visual effect when caught

## Prompt 21
Is there any way I can run all of this on Github Pages?

## Prompt 22
For the git push it tells me

remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/tristanr-cogapp/claude-art-heist.git/'

How can I get it to do it with SSH authentication instead?

## Prompt 23
I have created a blank repo at https://github.com/CogappLabs/claude-art-heist what should I do not to add the code?

## Prompt 24
What should I do to make it even more fun?

## Prompt 25
Add some music that intensifies as you progress

## Prompt 26
Make each end screen artwork box link to the artwork page on the AIC website (format https://www.artic.edu/artworks/[artwork id])

## Prompt 27
give me some ideas for powerups that could be added

## Prompt 28
Implement magnet, bulk heist shield and bribe. Also add a list of all available powerups on a starting splash screen

## Prompt 29
Why do the guards look faded most of the time?

## Prompt 30
They still appear faded until I collect the money bag power up

## Prompt 31
Make the powerups float around slightly

## Prompt 32
when I have the shield powerup active, fade the guards to indicate that I can hit one

## Prompt 33
when I have the bulk heist powerup, do some animated indication of the radius that it is heisting from

## Prompt 34
only show the radius when I trigger the bulk heist powerup, and animate it to indicate that it is collecting artworks

## Prompt 35
what else could make this more fun?

## Prompt 36
Add guard reactions so that they are more alert when you are near, but don't make it too difficult

## Prompt 37
Also add touch/click controls for mobile and mouse interaction

## Prompt 38
The tap to start does not work on the splash screen

## Prompt 39
There is no way to restart on mobile. Add an event on the ending screen, along with the words "Press R or treple-tap to restart, or tap on any artwork to find out more about it" to appear above the list of works.

## Prompt 40
Is there any way to add a persistant highscore table both locally and on Github Pages?

## Prompt 41
please add dreamlo support, and an extra optional way to enter a name if someone gets on the top 25

## Prompt 42
Make a way for those codes to remain private but still available to Github Pages without me commiting them to the repo

## Prompt 43
Wouldn't a better way to be to use a .env file locally and GitHub Secrets for GitHub Pages?
