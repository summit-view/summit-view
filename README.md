#summit-view

##Summit
A summit is a point on a surface that is higher in elevation than all points immediately adjacent to it. Mathematically, a summit is a local maximum in elevation.

##Usage
`$ npm install summit-view`

More docs coming. In the meantime take a look at [the example app](https://github.com/summit-view/summit-view-app-example).

##UI
List of preloaded stuff. **Don't include in a panel**.

**Icons**  

* [Font Awesome](https://fortawesome.github.io/Font-Awesome/)  

**Colors**  
These collections of colors is available as .{color} for text-color and .bg-{color}. Everything is kebab-case.  

* [flatuicolors.com](http://flatuicolors.com/)  
* [brandcolors.net](http://brandcolors.net/)  

##Current goals of the project

- [x] Support for moving and resizing panels, snap-to-grid.
- [x] Provide a settings API for panels.
- [ ] Extend the settings API with more setting-types. (number, true/false, radio, checkbox, select etc.)
- [ ] Themeable.
- [x] Configurable.
- [ ] Allow multiple instances of the same panel. *Things to keep in mind: backend-settings, browser-settings, namespaced router and socket.io namespace*.

##Inspiration
Summit view was inspired by the [Status Board by Panic Inc](https://panic.com/statusboard/) and the ongoing [Panic Board project at 24HR Malmö](https://www.24hr.se/projekt/strukturerad-information-via-storskarm/).

The idea is to deliver contextually relevant real-time data. Perfect for example in an office environment.
