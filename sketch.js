var totalCities = 200;
var cityRadius = 10;
var WIDTH = 2100;
var HEIGHT = 1100;
var border = 50;


var stars = [];
var cities = [];
var path = [];
var bestPath = [];
var previousPath = [];
var animation = -1;
var dragValue = -1;
var virtualCity;
var previousVirtualCity;
var deriv = 0;
var deriv2 = 0;

var nodeSelected = -1;
var pathSelected = -1;
var bestDist;

function tooClose(v) {
    let response = false;
    for (let i = 0; i < cities.length; i++) {
        if (dist(v.x, v.y, cities[i].x, cities[i].y) < 5*cityRadius) {
            response = true;
        }
    }

    if ((v.x < border || v.x > width - border) || (v.y < border || v.y > height - border)) {
        response = true;
    }
    return response;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }

function setup() {

    createCanvas(windowWidth, windowHeight);
    textSize(24);

    for (let i = 0; i < totalCities; i++) {
        var v = createVector(random(width), random(height));
        while (tooClose(v)) {
            v = createVector(random(width), random(height));
        }
        cities[i] = v;
        path[i] = i;
        previousPath[i] = i;
        bestPath[i] = i;
    }

    bestDist = currentDist();
    for (let i = 0; i < totalCities; i++) {
        let a = measureDistance(gci(i), gci(i + 1), gci(i + 2), gci(i + 3));
        let b = measureDistance(gci(i), gci(i + 2), gci(i + 1), gci(i + 3));
        if (b < a) {
            swap(gci(i + 1), gci(i + 2));
            break;
        }
    }

    for (let i = 0; i < 100; i++) {
        var v = createVector(random(width), random(height));
        stars[i] = v;
    }
}

function draw() {
    background(0);
    stroke(0);
    fill(230);
    text(floor(currentDist()), 90, 60);
    fill(150);
    text("Best :", 20, 30)
    text(floor(bestDist), 90, 30);

    // draw stars
    for (let i = 0; i < 100; i++) {
        stroke(random(i+20, i+50));
        ellipse((stars[i].x + deriv) % windowWidth, stars[i].y, i % 2 + 1, 1 + i % 2);
    }

    deriv2++;
    if (deriv2 > 10) {
        deriv2=0;
        deriv++;
    }

    // draw best path
    stroke("#880000");
    strokeWeight(1);
    noFill();
    beginShape();
    for (let i = 0; i < totalCities; i++) {
        vertex(cities[bestPath[i]].x, cities[bestPath[i]].y);
    }
    vertex(cities[bestPath[0]].x, cities[bestPath[0]].y);
    endShape();

    // draw current path
    strokeWeight(4);
    noFill();
    beginShape();

    if (animation == -1) {
        vertex(cities[path[0]].x, cities[path[0]].y)
        for (let i = 0; i < totalCities; i++) {
            stroke(255/4 + abs(i - totalCities/2) * 255 / totalCities);
            vertex(cities[path[i]].x, cities[path[i]].y);
            endShape();
            beginShape();
            vertex(cities[path[i]].x, cities[path[i]].y);
            if (pathSelected == i) {
                vertex(mouseX, mouseY);
            }
        }
        vertex(cities[path[0]].x, cities[path[0]].y)
        endShape();
    } else {
        vertex((60 - animation)/60 * cities[previousPath[0]].x + animation/60 * cities[path[0]].x, (60 - animation)/60 * cities[previousPath[0]].y + animation/60 * cities[path[0]].y);
        if (dragValue == 0) {
            vertex((60 - animation)/60 * previousVirtualCity.x + animation/60 * virtualCity.x, (60 - animation)/60 * previousVirtualCity.y + animation/60 * virtualCity.y)
        }
        for (let i = 0; i < totalCities; i++) {
            stroke(255/4 + abs(i - totalCities/2) * 255 / totalCities);
            if (previousPath[i] != path[i]) {
                vertex((60 - animation)/60 * cities[previousPath[i]].x + animation/60 * cities[path[i]].x, (60 - animation)/60 * cities[previousPath[i]].y + animation/60 *cities[path[i]].y)
                endShape();
                beginShape();
                vertex((60 - animation)/60 * cities[previousPath[i]].x + animation/60 * cities[path[i]].x, (60 - animation)/60 * cities[previousPath[i]].y + animation/60 *cities[path[i]].y)
            } else {
                vertex(cities[path[i]].x, cities[path[i]].y);
                endShape();
                beginShape();
                vertex(cities[path[i]].x, cities[path[i]].y);
            }
            if (pathSelected == i) {
                vertex(mouseX, mouseY);
            }

            if (i == dragValue - 1) {
                vertex((60 - animation)/60 * previousVirtualCity.x + animation/60 * virtualCity.x, (60 - animation)/60 * previousVirtualCity.y + animation/60 * virtualCity.y)
            }
        }
        if (dragValue == 0) {
            vertex((60 - animation)/60 * previousVirtualCity.x + animation/60 * virtualCity.x, (60 - animation)/60 * previousVirtualCity.y + animation/60 * virtualCity.y)
        }
        vertex((60 - animation)/60 * cities[previousPath[0]].x + animation/60 * cities[path[0]].x, (60 - animation)/60 * cities[previousPath[0]].y + animation/60 * cities[path[0]].y)
        endShape();
        animation++;
        if (animation == 60) {
            animation = -1;
            dragValue = -1;
            virtualCity = null;
            previousVirtualCity = null;
            updatePreviousPath();
            checkSwap();
        }
    }

    // draw cities
    fill("#0000AA");
    strokeWeight(4);
    stroke("#0000FF")
    for (let i = 0; i < totalCities; i++) {
        if (i == nodeSelected) {
            ellipse(cities[path[i]].x, cities[path[i]].y, 20, 20);
        } else {
            ellipse(cities[path[i]].x, cities[path[i]].y, 8, 8);
        }
    }
}

function updatePreviousPath() {
    for (let i = 0; i < totalCities; i++) {
        previousPath[i] = path[i];
    }
}

function measureDistance(i, j, k, l) {
    return getDistance(i, j) + getDistance(j, k) + getDistance(k, l);
}

function getDistance(i, j) {
    return dist(cities[path[i]].x, cities[path[i]].y, cities[path[j]].x, cities[path[j]].y);
}

// get city index
function gci(i) {
    if (i < totalCities) {
        if (i < 0) {
            return totalCities + i;
        } else {
            return i;
        }
    } else {
        return i - totalCities;
    }
}

function swap(i, j) {
    let tmp = path[i];
    path[i] = path[j];
    path[j] = tmp;
    launchAnim();
    updateBest();
}

function launchAnim() {
    animation = 0;
}

function currentDist() {
    let tmp = 0;
    for (let i = 0; i < totalCities; i++) {
        d = dist(cities[path[i]].x, cities[path[i]].y, cities[path[gci(i + 1)]].x, cities[path[gci(i + 1)]].y);
        tmp += d;
    }
    return tmp;
}

function updateBest() {
    if (currentDist() < bestDist) {
        bestDist = currentDist();
        for (let i = 0; i < totalCities; i++) {
            bestPath[i] = path[i];
        }
    }
    console.log(bestDist);
}

function checkSwap() {
    console.log('just checking');
    for (let i = 0; i < totalCities; i++) {
        let a = measureDistance(gci(i), gci(i + 1), gci(i + 2), gci(i + 3));
        let b = measureDistance(gci(i), gci(i + 2), gci(i + 1), gci(i + 3));
        if (b < a) {
            swap(gci(i + 1), gci(i + 2));
            updateBest();
            break;
        }
    }
}

function vecMag(a) {
    return a.x*a.x + a.y*a.y;
}

function mousePressed() {
    console.log('press');
    if (nodeSelected == -1) {
        let min = dist(mouseX, mouseY, cities[path[0]].x, cities[path[0]].y);
        for (let i = 0; i < totalCities; i++) {
            let tmp = dist(mouseX, mouseY, cities[path[i]].x, cities[path[i]].y);
            if (tmp <= min && tmp < cityRadius) {
                min = tmp;
                nodeSelected = i;
            }
        }
        if (nodeSelected == -1) {
            // check to select a path
            let tmpSelected = 0;
            let max = 0;
            for (let i = 0; i < totalCities; i++) {
                let a = createVector(cities[path[gci(i + 1)]].x - cities[path[i]].x, cities[path[gci(i + 1)]].y - cities[path[i]].y);
                let b = createVector(mouseX - cities[path[i]].x, mouseY - cities[path[i]].y);
                let c = (a.x * b.x + a.y * b.y) / (sqrt(a.x*a.x +a.y*a.y) * sqrt(b.x*b.x +b.y*b.y))
                if (vecMag(b) < vecMag(a)) {
                    if (c > max) {
                        max = c;
                        tmpSelected = i;
                    }
                }
            }
            pathSelected = tmpSelected;
        }
    } else {
        let min = dist(mouseX, mouseY, cities[path[0]].x, cities[path[0]].y);
        let tmpselect;
        for (let i = 0; i < totalCities; i++) {
            let tmp = dist(mouseX, mouseY, cities[path[i]].x, cities[path[i]].y);
            if (tmp <= min && tmp < cityRadius) {
                min = tmp;
                tmpselect = i;
            }
        }
        if (tmpselect != undefined && tmpselect < cities.length) {
            swap(nodeSelected, tmpselect);
            nodeSelected = -1;
        }
    }
}

function keyPressed() {
    for (let i = 0; i < totalCities; i++) {
        path[i] = bestPath[i];
    }
}

function mouseDragged() {
    console.log('drag');
}

function mouseReleased() {
    // check if city is close, connect
    let min = dist(mouseX, mouseY, cities[path[0]].x, cities[path[0]].y);
    let tmpSelected = -1;
    for (let i = 0; i < totalCities; i++) {
        let tmp = dist(mouseX, mouseY, cities[path[i]].x, cities[path[i]].y);
        if (tmp <= min && tmp < cityRadius) {
            min = tmp;
            tmpSelected = i;
        }
    }

    if (pathSelected > -1 && tmpSelected > -1) {
        buff = path[tmpSelected];
        previousVirtualCity = cities[path[tmpSelected]];
        console.log(tmpSelected);
        virtualCity = createVector((cities[path[gci(tmpSelected - 1)]].x + cities[path[gci(tmpSelected + 1)]].x)/2, (cities[path[gci(tmpSelected - 1)]].y + cities[path[gci(tmpSelected + 1)]].y)/2);
        if (tmpSelected < pathSelected) {
            dragValue = tmpSelected;
            path.splice(pathSelected + 1, 0, buff);
            path.splice(tmpSelected, 1);
        } else {
            dragValue = tmpSelected + 1;
            path.splice(tmpSelected, 1);
            path.splice(pathSelected + 1, 0, buff);
        }
        console.log(dragValue);
        updatePreviousPath();
    }

    pathSelected = -1;
    launchAnim();
    updateBest();
}