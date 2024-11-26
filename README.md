<strong>COMP 3612 - Assignment 2</strong>
<br>F1 Dashboard - Single-Page Application</br>
HTML, Tailwind CSS, and Javascript
<br><em>Juliana Marie Tafalla</em></br>

<strong><em>Welcome to the Formula One (F1) Dashboard!</em></strong>
<br>In this single-page application, developed with HTML, Tailwind CSS, and Javascript, users can view Formula One race data from 2020 to 2023.</br>
Developed by the one and only, Juliana Marie Tafalla

<strong>General Note(s)</strong>
- When running the website for the first time, data must be fetched and stored in the localStorage first.
  If so, please wait a few seconds for the necessary data to be fetched and stored (...I did not implement a loading screen)! Otherwise, it's smooth sailing from here!
- The response for adding a circuit/driver/constructor to the Favourites list is subtle (that is, I did not implement a toaster for it...).
  Simply hover over the <strong>[Favourite]</strong> button to see that you have added an item to the Favourites list!
- The images and icons used in this project does not belong to me! Please see the <em>credits.txt</em> text document to see where the images and icons have been downloaded from.
- Considering that no images were provided during/after the development, the images used for the driver and circuit is simply the home page's main image as a placeholder.

<strong>index.html</strong>
<br>I've done my best to label the views and provide descriptions as needed. The markup is structured as such:</br>
- <em>HOME VIEW
- RACES VIEW
- CONSTRUCTOR DIALOG
- DRIVER DIALOG 
- CIRCUIT DIALOG
- FAVOURITES DIALOG</em>

<strong>assign2.js</strong>
<br>I've done my best to organize the program's structure and its functions based on their common purpose, as listed below:</br>
- <em>MAIN PROGRAM</em>
  - ...
- <em>HELPER FUNCTION DECLARATIONS AND EXPRESSIONS</em>
  - setup functions
  - toggle view(s) functions
  - load (display) functions
  - events functions
  - update functions
  - other functions
