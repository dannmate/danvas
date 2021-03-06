"use strict";

(function () {
  var socket = io();
  var canvas = document.getElementsByClassName("whiteboard")[0];
  var colors = document.getElementsByClassName("color");
  var sizes = document.getElementsByClassName("size");
  var context = canvas.getContext("2d");

  var current = {
    color: "black",
    lineWidth: 2,
  };
  var drawing = false;

  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
  canvas.addEventListener("mouseout", onMouseUp, false);
  canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener("touchstart", onMouseDown, false);
  canvas.addEventListener("touchend", onMouseUp, false);
  canvas.addEventListener("touchcancel", onMouseUp, false);
  canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener("click", onColorUpdate, false);
  }

  for (var i = 0; i < sizes.length; i++) {
    sizes[i].addEventListener("click", onSizeUpdate, false);
  }

  socket.on("drawing", onDrawingEvent);

  window.addEventListener("resize", onResize, false);
  onResize();

  function drawLine(x0, y0, x1, y1, color, lineWidth, emit) {
    context.beginPath();

    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit("drawing", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      lineWidth: lineWidth,
    });
  }

  function onMouseDown(e) {
    drawing = true;

    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }

  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      current.lineWidth,
      true
    );
  }

  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      current.lineWidth,
      true
    );

    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }

  function onColorUpdate(e) {
    var currentColor = e.target.getAttribute("class");

    var svgcolors = document.getElementsByClassName("svgcolor");
    for (var i = 0; i < svgcolors.length; i++) {
      if (svgcolors[i].getAttribute("class").split(" ")[1] == currentColor) {
        svgcolors[i].style.stroke = currentColor;
      } else {
        svgcolors[i].style.stroke = "";
      }
      //console.log(svgcolors[i].getAttribute("class").split(" ")[1]);
   
    }
    current.color = currentColor;
  }

  function onSizeUpdate(e) {
    console.log(e.target.className.split(" ")[1]);
    switch (e.target.className.split(" ")[1]) {
      case "small":
        current.lineWidth = 2;
        break;
      case "medium":
        current.lineWidth = 5;
        break;
      case "large":
        current.lineWidth = 7;
        break;
    }
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
      var time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    drawLine(
      data.x0 * w,
      data.y0 * h,
      data.x1 * w,
      data.y1 * h,
      data.color,
      data.lineWidth
    );
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
})();

var fullscreen = false;
function toggleFullscreen() {
  var elem = document.getElementById("maindiv");

  if (!fullscreen) {
    fullscreen = true;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
      }
  } else {
    fullscreen=false;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }
  }
}
