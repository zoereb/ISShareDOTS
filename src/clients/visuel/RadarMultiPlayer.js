//yoyoyo
//en fait c'est qu'une pale copie du radar.js, mais cette fois-ci pour tous les rasbery et surtout aux couleurs de l'amitié !

class RadarMultiPlayer {
  constructor(canvas, players, parameter) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.players = players; // collection soundworks
    this.parameter = parameter;

    this.center = { x: canvas.width / 2, y: canvas.height / 2 };
    this.radius = 180;
    this.pointSize = 10;
    this.draggedPoint = null;
    this.hoveredPoint = null;

    // Construire la liste ordonnée des players par id
    this.playerList = [];
    this.players.forEach(p => this.playerList.push(p));
    this.playerList.sort((a, b) => a.get('id') - b.get('id'));

    this.setupEventListeners();
    this.draw();
  }

  // Mettre à jour la liste si un player se connecte/déconnecte
  refreshPlayerList() {
    this.playerList = [];
    this.players.forEach(p => this.playerList.push(p));
    this.playerList.sort((a, b) => a.get('id') - b.get('id'));
  }

  getPointCoordinates(index) {
    const player = this.playerList[index];
    if (!player) return { x: this.center.x, y: this.center.y, angle: 0, value: 0, normalizedValue: 0 };

    const duration = player.get(this.parameter);
    const description = player.getDescription(this.parameter);
    const max = description?.max ?? 1;
    const min = description?.min ?? 0;

    const angle = (index / 8 * Math.PI * 2) - Math.PI / 2;
    const normalizedDuration = Math.max(0, Math.min(1, (duration - min) / (max - min)));
    const distance = normalizedDuration * this.radius;

    return {
      x: this.center.x + Math.cos(angle) * distance,
      y: this.center.y + Math.sin(angle) * distance,
      angle,
      value: duration,
      normalizedValue: normalizedDuration,
      label: `R${player.get('id')}`, // label raspberry
    };
  }

  getClosestPoint(mouseX, mouseY) {
    const dx = mouseX - this.center.x;
    const dy = mouseY - this.center.y;
    const clickAngle = Math.atan2(dy, dx);

    let closestPoint = null;
    let minAngleDiff = Infinity;
    const count = Math.min(this.playerList.length, 8);

    for (let i = 0; i < count; i++) {
      const pointAngle = (i / 8 * Math.PI * 2) - Math.PI / 2;
      let angleDiff = Math.abs(clickAngle - pointAngle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

      if (angleDiff < minAngleDiff) {
        minAngleDiff = angleDiff;
        closestPoint = i;
      }
    }

    return minAngleDiff < Math.PI / 8 ? closestPoint : null;
  }

  getPointAtPosition(mouseX, mouseY) {
    const threshold = this.pointSize + 8;
    const count = Math.min(this.playerList.length, 8);

    for (let i = 0; i < count; i++) {
      const point = this.getPointCoordinates(i);
      const dx = mouseX - point.x;
      const dy = mouseY - point.y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold) return i;
    }

    return this.getClosestPoint(mouseX, mouseY);
  }
  
//
  updatePoint(pointIndex, mouseX, mouseY) {
    const player = this.playerList[pointIndex];
    if (!player) return;

    const dx = mouseX - this.center.x;
    const dy = mouseY - this.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const description = player.getDescription(this.parameter);
    const max = description?.max ?? 1;
    const min = description?.min ?? 0;

    const normalizedDistance = Math.max(0, Math.min(1, distance / this.radius));
    let value = min + normalizedDistance * (max - min);
    value = Math.round(value * 100) / 100;

    player.set(this.parameter, value);
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.draggedPoint = this.getPointAtPosition(e.clientX - rect.left, e.clientY - rect.top);
    if (this.draggedPoint !== null) {
      this.updatePoint(this.draggedPoint, e.clientX - rect.left, e.clientY - rect.top);
      this.draw();
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.draggedPoint !== null) {
      this.updatePoint(this.draggedPoint, mouseX, mouseY);
      this.draw();
    } else {
      const hovered = this.getClosestPoint(mouseX, mouseY);
      if (hovered !== this.hoveredPoint) {
        this.hoveredPoint = hovered;
        this.draw();
      }
    }
  }

  onMouseUp() {
    this.draggedPoint = null;
    this.draw();
  }

  onTouchStart(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.draggedPoint = this.getPointAtPosition(touch.clientX - rect.left, touch.clientY - rect.top);
    if (this.draggedPoint !== null) {
      this.updatePoint(this.draggedPoint, touch.clientX - rect.left, touch.clientY - rect.top);
      this.draw();
    }
  }

  onTouchMove(e) {
    e.preventDefault();
    if (this.draggedPoint !== null) {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.updatePoint(this.draggedPoint, touch.clientX - rect.left, touch.clientY - rect.top);
      this.draw();
    }
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onMouseUp.bind(this));
  }

  draw() {
    const ctx = this.ctx;
    const center = this.center;
    const count = Math.min(this.playerList.length, 8);

    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Cercles concentriques
    for (let i = 1; i <= 4; i++) {
      ctx.strokeStyle = `rgba(100, 255, 218, ${0.08 + i * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center.x, center.y, (this.radius / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axes radiaux + labels raspberry
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8 * Math.PI * 2) - Math.PI / 2;
      const isHovered = this.hoveredPoint === i;
      const isDragged = this.draggedPoint === i;
      const hasPlayer = i < count;

      ctx.strokeStyle = (isHovered || isDragged)
        ? 'rgba(255, 215, 61, 0.6)'
        : hasPlayer ? 'rgba(100, 255, 218, 0.25)' : 'rgba(100, 255, 218, 0.08)';
      ctx.lineWidth = (isHovered || isDragged) ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(center.x + Math.cos(angle) * this.radius, center.y + Math.sin(angle) * this.radius);
      ctx.stroke();

      // Label
      const labelDist = this.radius + 22;
      const labelX = center.x + Math.cos(angle) * labelDist;
      const labelY = center.y + Math.sin(angle) * labelDist;

      ctx.fillStyle = !hasPlayer ? 'rgba(255,255,255,0.2)'
        : (isHovered || isDragged) ? 'rgba(255, 215, 61, 1)' : 'rgba(255, 255, 255, 0.8)';
      ctx.font = (isHovered || isDragged) ? 'bold 15px sans-serif' : 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Affiche "R1"..."R8" ou juste le numéro si pas de player
      const label = hasPlayer ? `R${this.playerList[i].get('id')}` : `${i + 1}`;
      ctx.fillText(label, labelX, labelY);
    }

    // Connexions entre points
    if (count > 1) {
      ctx.strokeStyle = 'rgba(202, 91, 152, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const point = this.getPointCoordinates(i);
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = 'rgba(202, 91, 152, 0.12)';
      ctx.fill();
    }

    // Point central
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ca5b98';
    ctx.fillStyle = '#ca5b98';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Points des players
    for (let i = 0; i < count; i++) {
      const point = this.getPointCoordinates(i);
      const isHovered = this.hoveredPoint === i;
      const isDragged = this.draggedPoint === i;

      ctx.shadowBlur = isDragged ? 25 : isHovered ? 20 : 12;
      ctx.shadowColor = isDragged ? '#ff6b6b' : isHovered ? '#ffd93d' : '#ca5b98';
      ctx.fillStyle = isDragged ? '#ff6b6b' : isHovered ? '#ffd93d' : '#ca5b98';
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.pointSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.pointSize / 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Valeur au survol
      if (isHovered || isDragged) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        const textY = point.normalizedValue < 0.15
          ? point.y + this.pointSize + 18
          : point.y - this.pointSize - 12;
        ctx.fillText(point.value, point.x, textY);
        ctx.shadowBlur = 0;
      }
    }

    ctx.shadowBlur = 0;
  }
}

export default RadarMultiPlayer;
