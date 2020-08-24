const curveContainer = document.getElementById('curves');
const lineContainer = document.getElementById('metro-map');

function posh(elem, x, y, len) {
    if (len > 0) {
        x -= 4;
        len += 8;
        elem.style.transform = `translate(${x}px,${y}px)`;
        elem.style.width = `${len}px`;
    } else {
        len = Math.abs(len);
        len += 8;
        elem.style.transform = `translate(${x - len}px,${y}px)`;
        elem.style.width = `${len}px`;
    }
    return elem;
}

function posv(elem, x, y, len) {
    if (len > 0) {
        y -= 4;
        len += 8;
        elem.style.transform = `translate(${x}px,${y}px)`;
        elem.style.height = `${len}px`;
    } else {
        len = Math.abs(len);
        elem.style.transform = `translate(${x}px,${y - len}px)`;
        elem.style.height = `${len}px`;
    }
    return elem;
}

// direction: ne nw se sw
function curve(x, y, dir, size = 10) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    let xDir, yDir;
    let cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0;

    switch (dir[0]) {
        case 'n':
        case 's':
            cy1 = yDir = -getDirVector(dir[0]).y;
            cx2 = xDir = getDirVector(dir[1]).x;
            break;
        case 'w':
        case 'e':
            cx1 = xDir = -getDirVector(dir[0]).x;
            cy2 = yDir = getDirVector(dir[1]).y;
            break;
        default:
            break;

    }

    const curve_len = size * 0.5; // || 2/3;
    const x2 = x + size * xDir;
    const y2 = y + size * yDir;

    elem.setAttribute('d', `M ${x} ${y} C ${x + curve_len * cx1} ${y + curve_len * cy1} ${x2 - curve_len * cx2} ${y2 - curve_len * cy2} ${x2} ${y2}`);
    elem.setAttribute('fill', 'none');
    elem.setAttribute('stroke', '#e03218');
    elem.setAttribute('stroke-width', 8);
    curveContainer.appendChild(elem);
}

function Line(x, y, color) {
    this.endX = this.startX = x;
    this.endY = this.startY = y;
    this.color = color;
}

function getDirVector(dir) {
    let x = 0, y = 0;
    switch (dir) {
        case 'n':
            y = -1;
            break;
        case 'w':
            x = -1;
            break;
        case 's':
            y = 1;
            break;
        case 'e':
            x = 1;
        default:
            break;
    }

    return { x, y };
}

function opposite(dir) {
    switch (dir) {
        case 'w': return 'e';
        case 'e': return 'w';
        case 's': return 'n';
        case 'n': return 's';
    }
}

Line.prototype.turn = function (dir, size = 8) {
    curve(this.endX, this.endY, opposite(this.prevDir) + dir, size);
    return this;
}

Line.prototype.continue = function (stations, len, dir, classes) {
    const line = new Line(this.endX, this.endY, this.color);
    line.position(dir, stations, len, classes);
    line.prevDir = dir;
    return line;
}

Line.prototype.prepend = function (stations, len, dir, classes) {
    const line = new Line(this.startX, this.startY, this.color);
    line.position(dir, stations, len, classes);
    return line;
}

Line.prototype.setColor = function (color) {
    this.color = color;
    return this;
}

Line.prototype.end = function (station, classes) {
    const line = new Line(this.endX, this.endY, this.color);
    const elem = document.createElement('div');
    elem.className = classes;
    elem.innerHTML = `<span class="label">${station}</span>`;;
    elem.style.transform = `translate(${this.endX}px,${this.endY}px)`;
    lineContainer.appendChild(elem);
    return line;
}

Line.prototype.position = function (dir, stations, len, classes) {
    const { x: xDir, y: yDir } = getDirVector(dir);
    const elem = create(stations, this.color);
    classes && elem.classList.add(classes);
    if (xDir !== 0) {
        elem.classList.add('horizontal');
        this.elem = posh(elem, this.startX, this.startY, len * xDir);
        this.endX = this.startX + len * xDir;
    }
    if (yDir !== 0) {
        elem.classList.add('vertical');
        this.elem = posv(elem, this.startX, this.startY, len * yDir);
        this.endY = this.startY + len * yDir;
    }
}

function start(x, y) {
    return new Line(x, y);
}

function create(stations, classes) {
    const elem = document.createElement('div');
    elem.className = 'line ' + classes;
    let innerHTML = '';
    for (const station of stations) {
        if (station)
            innerHTML += `<div class="station"><span class="label">${station}</span></div>`;
        else
            innerHTML += `<div class="empty"></div>`
    }
    elem.innerHTML = innerHTML;
    lineContainer.appendChild(elem);
    return elem;
}

const zagrebcanka = start(50, 250)
    .setColor('red')
    .continue(['Ljubljanica', 'Selska', 'Nehajska', 'Trešnjevački trg', 'Badalićeva', 'Tehnički m.', null], 300, 'e', 'line-end')
    .continue(['Stud. centar', 'Zagrebčanka'], 200, 's')
zagrebcanka.continue(['Vrbik', 'Miramarska', 'Lisinski', 'Kruge', 'Strojarska'], 300, 'e')
    .continue(['Držićeva'], 100, 'e')
    .continue(['Olipska', 'Radnička', 'Heinzelova', 'Donje Svetice', 'Ivanićgradska'], 250, 'e')
    .continue([null, 'Getaldićeva', 'Čavićeva', 'Žitnjak', 'Elka', 'Munja', 'Zagrebački transporti', 'Savišće'], 200, 's', 'line-end');

const savski_most = zagrebcanka.setColor('blue')
    .continue(['Veslačka', 'Prisavlje', 'Vjesnik', 'Učiteljska akademija'], 200, 's')
    .continue(['Stud. dom "S. Radić"', 'Savski most'], 50, 'w');
zagrebcanka.prepend(['Frankopanska', 'Trg Republike Hrvatske', 'Vodnikova'], 200, 'n');
savski_most.continue(['Prečko', 'Slavenskoga', 'M. Radev', 'Petrovaradinska', 'Rudeška', 'Jarun', 'Staglišće', 'Srednjaci', 'Horvati', 'Knežija', null], 250, 'w', 'line-end');

savski_most.setColor('green')
    .continue(['Arena Zagreb'], 100, 's')
    .continue(['Savski Gaj', 'Trnsko', 'Velesajam', 'Muzej suvremene umjetnosti', 'Sopot', 'Središće', 'Utrina', 'Zapruđe'], 400, 'e')
    .continue(['Slavonska', 'Folnegovićevo naselje', 'Borovje', 'Most mladosti'], 300, 'n')
    .continue(['Autobusni kolodvor'], 200, 'n')
    .continue(['Kvaternikov trg', 'Tržnica kvatrić', null, 'Trg kralja Petra Krešimira IV.'], 250, 'n');

// vodnikova - glavni - autobusni
const vodnikova = zagrebcanka.setColor('orange').prepend(['Vodnikova', 'Botanički vrt'], 150, 'e');
const glavni_kolodvor = vodnikova.continue(['Glavni kolodvor'], 50, 'e');
glavni_kolodvor.continue(['Branimirova', 'Branimirova tržnica'], 150, 'e');
// glavni - trg bana jj
const trg_bana_jj = glavni_kolodvor.prepend(['Zrinjevac'], 200, 'n')
    .setColor('yellow')
    .continue(['Trg bana Josipa Jelačića'], 150, 'w');

// črnomerec
trg_bana_jj.continue(['Sveti Duh', 'Mandaličina', 'Slovenska', 'Trg dr. F. Tuđmana', 'Frankopanska', null], 300, 'w', 'line-end')

// dubrava
trg_bana_jj.prepend(['Draškovićeva'], 50, 'n')
    .continue(['Vončinina', 'Petrova'], 150, 'e')
    .continue([null, 'Kvaternikov trg', 'Mašićeva', 'Jordanovac', 'Park Maksimir', 'Hondlova', 'Ravnice', 'Dubrava', 'Kapucinska', 'Grižanska', 'Dankovečka', 'Čulinečka', 'Aleja javora', 'Poljanice IV.', 'Dubec'], 400, 'e', 'line-end')


// borongaj
trg_bana_jj
    .setColor('purple')
    .prepend(['Trg hrvatskih velikana'], 100, 'e')
    .continue(['Trg žrtava fašizma'], 100, 's')
    .continue(['Šubićeva'], 100, 'e')
    .continue([null, 'Tuškanova', 'Heinzelova', 'Šulekova', 'Harambašićeva', 'Svetice', 'Borongaj'], 300, 'e', 'line-end');
