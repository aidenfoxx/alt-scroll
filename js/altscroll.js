/** 
 * Alternate Scroll
 * 
 * @version    0.1.0
 * @author     Aiden Foxx
 * @license    MIT License 
 * @copyright  2015 Aiden Foxx
 * @link       http://github.com/aidenfoxx
 * @twitter    @furiousfoxx
 */ 

'use strict';

function AltScroll(container, options)
{
    if (!(this instanceof AltScroll))
        return new AltScroll(container, options);
    
    this.container = container;
    this.content = container.children[0];

    this.scrollbarSize = this.calcScrollbarSize();
    this.scrollEvent = null;
    this.scrollFrame = null;
    this.scrollTimeout = null;

    this.dragEvent = null;
    this.dragBegin = null;
    this.dragInitVec = { x: 0, y: 0 };
    this.dragInitMouseVec = { x: 0, y: 0 };

    this.resizeTimeout = null;

    this.options = {
        snap: false,
        snapSpeed: 300,
        scrollLock: false,
        scrollLockThreshold: 20,
        momentum: true,
        momentumFalloff: .006
    };

    for (var key in options)
        this.options[key] = options[key];

    this.hideScrollbars();
    this.resizeCallback();
    this.bindEvents();
}

AltScroll.prototype.calcRelativePos = function(x, y)
{
    return { x: x - this.containerRect.left, y: y - this.containerRect.top };
}

AltScroll.prototype.calcTouchCoords = function(e)
{
    return this.calcRelativePos(!e.changedTouches ? e.pageX : e.changedTouches[0].pageX, !e.changedTouches ? e.pageY : e.changedTouches[0].pageY);
}

AltScroll.prototype.clacPointDistance = function(point1, point2)
{
    var distX = point2.x - point1.x;
    var distY = point2.y - point1.y;
    return Math.sqrt((distX * distX) + (distY * distY));
}

AltScroll.prototype.calcNearestChild = function()
{
    var nearest = null;
    var nearestIndex = 0;

    for (var i = 0, len = this.childRect.length; i < len; i++)
    {
        var pos = this.calcRelativePos(this.childRect[i].left, this.childRect[i].top);
        var distance = this.clacPointDistance({ x: this.container.scrollLeft, y: this.container.scrollTop }, pos);

        if (!i || distance < nearest)
        {
            nearest = distance;
            nearestIndex = i;
        }
    }
    return nearestIndex;
}

AltScroll.prototype.calcScrollbarSize = function()
{
    var outer = document.createElement('div');
    var inner = document.createElement('div');

    inner.style.width = '100%';
    outer.style.width = '100px';
    outer.style.overflowY = 'scroll';
    outer.appendChild(inner);

    document.body.appendChild(outer);

    var scrollbarSize = 100 - inner.offsetWidth;

    outer.parentNode.removeChild(outer);

    return scrollbarSize;
}

AltScroll.prototype.getChildRect = function()
{
    var children = [];

    var scrollTop = this.container.scrollTop;
    var scrollLeft = this.container.scrollLeft;

    this.container.scrollTop = 0;
    this.container.scrollLeft = 0;

    for (var i = 0, len = this.content.children.length; i < len; i++)
        children.push(this.content.children[i].getBoundingClientRect());

    this.container.scrollTop = scrollTop;
    this.container.scrollLeft = scrollLeft;

    return children;
}

AltScroll.prototype.hideScrollbars = function()
{
    var parent = this.container.parentElement;

    if (parent.className.indexOf('hide-scroll') > -1)
    {
        this.container.style.width = (parent.offsetWidth + this.scrollbarSize) + 'px';
        this.container.style.height = (parent.offsetHeight + this.scrollbarSize) + 'px';
    }
}

AltScroll.prototype.bindEvents = function()
{
    this.scrollEvent = this.scroll.bind(this);
    this.container.addEventListener('scroll', this.scrollEvent);
    this.container.addEventListener('mousedown', this.dragStart.bind(this));
    window.addEventListener('mouseup', this.dragEnd.bind(this));
    window.addEventListener('resize', this.resize.bind(this));
}

AltScroll.prototype.resize = function()
{
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(function() { this.resizeCallback(); }.bind(this), 500);
}

AltScroll.prototype.resizeCallback = function()
{
    this.hideScrollbars();
    this.containerRect = this.container.getBoundingClientRect();
    this.contentRect = this.content.getBoundingClientRect();
    this.childRect = this.getChildRect();
}

AltScroll.prototype.scrollTo = function(x, y, speed, easing)
{
    var contentWidth = this.contentRect.width - this.containerRect.width + this.scrollbarSize;
    var contentHeight = this.contentRect.height - this.containerRect.height + this.scrollbarSize;

    // Collision detection
    if (x < 0 || x > contentWidth)
    {
        var moveX = x - this.container.scrollLeft;
        x = x < 0 ? 0 : contentWidth;
        var clampX = Math.abs(x - this.container.scrollLeft) / Math.abs(moveX);
    }

    if (y < 0 || y > contentHeight)
    {
        var moveY = y - this.container.scrollTop;
        y = y < 0 ? 0 : contentHeight;
        var clampY = Math.abs(y - this.container.scrollTop) / Math.abs(moveY);
    }

    if (!clampX && clampY)
        speed *= clampY;
    else if (clampX && !clampY)
        speed *= clampX;
    else if (clampX && clampY)
        speed *= clampX < clampY ? clampX : clampY;

    window.cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = window.requestAnimationFrame(function() { this.scrollToFrame(Date.now(), this.container.scrollLeft, x, this.container.scrollTop, y, speed, easing); }.bind(this))
}

AltScroll.prototype.scrollToFrame = function(startTime, fromX, toX, fromY, toY, speed, easing)
{
    if (speed > 0)
    {
        var delta = Date.now() - startTime;
        var animPercent = delta / speed;

        if (animPercent < 1)
        {
            this.container.scrollLeft = Math.round(fromX + ((toX - fromX) * (!easing ? animPercent : easing(animPercent))));
            this.container.scrollTop = Math.round(fromY + ((toY - fromY) * (!easing ? animPercent : easing(animPercent))));
            this.scrollFrame = window.requestAnimationFrame(function() { this.scrollToFrame(startTime, fromX, toX, fromY, toY, speed, easing); }.bind(this));
            return;
        }
    }
    this.container.scrollLeft = Math.round(toX);
    this.container.scrollTop = Math.round(toY);
    this.scrollEnd();
}

AltScroll.prototype.scrollEnd = function()
{
    if (!this.scrollEvent)
    {
        this.scrollEvent = this.scroll.bind(this);
        this.container.addEventListener('scroll', this.scrollEvent);
    }   
}

AltScroll.prototype.snapTo = function(i, speed, easing)
{
    if (!this.childRect[i])
        return false;
    var snapPos = this.calcRelativePos(this.childRect[i].left, this.childRect[i].top);
    this.scrollTo(snapPos.x, snapPos.y, speed >= 0 ? speed : this.options.snapSpeed, typeof EasingFunctions === 'object' ? EasingFunctions.easeOutCubic : easing);
}

AltScroll.prototype.snapToNearest = function(speed, easing)
{
    return this.snapTo(this.calcNearestChild(), speed, easing);   
}

AltScroll.prototype.scroll = function(e)
{
    if (this.options.snap)
    {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(function() {
            this.container.removeEventListener('scroll', this.scrollEvent);
            this.scrollEvent = null;
            this.snapToNearest();
        }.bind(this), 500); 
    }
} 

AltScroll.prototype.dragStart = function(e)
{
    e.preventDefault();

    if (!this.dragEvent)
    {
        this.dragBegin = Date.now();
        this.dragInitMouseVec = this.calcTouchCoords(e);
        this.dragInitVec = { x: this.container.scrollLeft, y: this.container.scrollTop };
        this.dragEvent = this.drag.bind(this);
        this.container.addEventListener('mousemove', this.dragEvent);
    }
}

AltScroll.prototype.drag = function(e)
{
    e.preventDefault();

    var mousePos = this.calcTouchCoords(e);
    var moveX = this.dragInitMouseVec.x - mousePos.x;
    var moveY = this.dragInitMouseVec.y - mousePos.y;

    this.scrollTo(this.dragInitVec.x + moveX, this.dragInitVec.y + moveY, 0);
}

AltScroll.prototype.dragEnd = function(e)
{
    if (this.dragEvent)
    {
        window.cancelAnimationFrame(this.scrollFrame);

        if (this.options.momentum)
        {
            var mousePos = this.calcTouchCoords(e);
            var dragTime = Date.now() - this.dragBegin;

            // Based on movement since we started dragging
            var velX = (this.dragInitMouseVec.x - mousePos.x) / dragTime;
            var velY = (this.dragInitMouseVec.y - mousePos.y) / dragTime;

            // Use the highest velocity
            var animationLength = Math.abs(Math.abs(velX) > Math.abs(velY) ? velX : velY) / this.options.momentumFalloff;

            // Calculate final position
            var newX = this.container.scrollLeft + (Math.abs(velX) * velX) / (this.options.momentumFalloff * 2);
            var newY = this.container.scrollTop + (Math.abs(velY) * velY) / (this.options.momentumFalloff * 2);

            this.scrollTo(newX, newY, animationLength, typeof EasingFunctions === 'object' ? EasingFunctions.easeOutCubic : null);
        }

        this.container.removeEventListener('mousemove', this.dragEvent);
        this.dragEvent = null;
    }
}