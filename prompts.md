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
