# Alternate Scroll (Version 0.2.0)
Alternet Scroll is a modified version of Lite Scroll designed to act as touch shiv for the native browser scroller, which differs from Lite Scroll which acts as a complete overhaul of the touch scrolling events.

I only reccomend using this plugin over Lite Scroll if you need native scroll events, better performance or older browser support. Otherwise Lite Scroll offers far more functionality and a better touch experience.

Script example (http://foxx.io/altscroll/).

## Requirements
To enable easing you must first have the following easing plugin by gre, enabled (https://gist.github.com/gre/1650294).

## Usage
The script accepts a number of parameters:

```javascript
var element = document.getElementById('scroll');

var scroll = AltScroll(element, options);
```

The structure of the HTML follows the syntax:

```html
<!-- Top level container is only required if you wish to hide the scroll bars -->
<div id="scroll-container" class="hide-scroll">
    <div id="scroll">
        <div class="content">
            Content
        </div>
    </div>
</div>
```

## Options

All avalible options are:

```javascript
var options = {
    snap: false,
    snapSpeed: 300,
    momentum: true,
    momentumFalloff: .006
};
```

### 'snap'
Defines if the scroller will snap to elements inside the content container.

### 'snapSpeed'
Defines the length of time in milliseconds that the scroller will take to animate snapping.

### 'momentum'
Defines if scrolling will have momentum.

### 'momentumFalloff'
Defines the speed at which the momentum slows based on pixels per millisecond.

## Methods
The script has multiple avalible methods.

```javascript
var scroll = LiteScroll(element, options);

// Will scroll the defined coordinates (px, px, ms, jsEasingObjectFunction, function)
scroll.scrollTo(x, y, speed, easing, callback)

// Will snap to a child element of the scroller based on the dom index (int, ms, jsEasingObjectFunction, function)
scroll.snapTo(domIndex, speed, easing, callback)

// Will snap to the nearest child element of the scroller (ms, jsEasingObjectFunction, function)
scroll.snapToNearest(speed, easing, callback)
````

## Browser Compatibility
The plugin has been tested and is working in all major web browsers, and supports IE9 and above.

## Future Development
- All done for now. I'm open to suggestions.

## License
All code is free to use and distribute under MIT License unless otherwise specified.
