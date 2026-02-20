class RadarController {
  constructor(canvas, player) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.player = player;
    this.center = { x: canvas.width / 2, y: canvas.height / 2 };

    this.radius = 180;
    this.pointSize = 10;
    this.rotation = 0;
    this.draggedPoint = null;
    this.hoveredPoint = null;

    this.setupEventListeners();
    this.draw();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
      // AJOUTE CES 3 LIGNES pour le tactile :
  this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
  this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
  this.canvas.addEventListener('touchend', this.onMouseUp.bind(this));
  }

  getPointCoordinates(index) {
    const position = this.player.get(`position_${index + 1}`);
    const description = this.player.getDescription(`position_${index + 1}`);
    const max = description.max || 127;
    const min = description.min || 0;

    const angle = (index / 8 * Math.PI * 2) - Math.PI / 2;
    const normalizedPosition = Math.max(0, Math.min(1, (position - min) / (max - min)));
    const distance = normalizedPosition * this.radius;

    return {
      x: this.center.x + Math.cos(angle) * distance,
      y: this.center.y + Math.sin(angle) * distance,
      angle: angle,
      value: position,
      normalizedValue: normalizedPosition
    };
  }

  getClosestPoint(mouseX, mouseY) {
    const dx = mouseX - this.center.x;
    const dy = mouseY - this.center.y;
    let clickAngle = Math.atan2(dy, dx);

    let closestPoint = 0;
    let minAngleDiff = Infinity;

    for (let i = 0; i < 8; i++) {
      const pointAngle = (i / 8 * Math.PI * 2) - Math.PI / 2;
      let angleDiff = Math.abs(clickAngle - pointAngle);

      if (angleDiff > Math.PI) {
        angleDiff = 2 * Math.PI - angleDiff;
      }

      if (angleDiff < minAngleDiff) {
        minAngleDiff = angleDiff;
        closestPoint = i;
      }
    }

    const maxAngleDiff = Math.PI / 8;
    if (minAngleDiff < maxAngleDiff) {
      return closestPoint;
    }

    return null;
  }

  getPointAtPosition(mouseX, mouseY) {
    const threshold = this.pointSize + 8;

    for (let i = 0; i < 8; i++) {
      const point = this.getPointCoordinates(i);
      const dx = mouseX - point.x;
      const dy = mouseY - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < threshold) {
        return i;
      }
    }

    return this.getClosestPoint(mouseX, mouseY);
  }

  updatePointPosition(pointIndex, mouseX, mouseY) {
    const dx = mouseX - this.center.x;
    const dy = mouseY - this.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const description = this.player.getDescription(`position_${pointIndex + 1}`);
    const max = description.max || 127;
    const min = description.min || 0;

    // Normaliser la distance (0 à 1)
    const normalizedDistance = Math.max(0, Math.min(1, distance / this.radius));

    // Convertir en valeur réelle
   /*  let value = Math.round(min + normalizedDistance * (max - min));
    value = Math.max(min, Math.min(max, value)); */
    let value = min + normalizedDistance * (max - min);
// Arrondir à 2 décimales
value = Math.round(value * 100) / 100;

    this.player.set(`position_${pointIndex + 1}`, value);
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    this.draggedPoint = this.getPointAtPosition(mouseX, mouseY);

    if (this.draggedPoint !== null) {
      this.updatePointPosition(this.draggedPoint, mouseX, mouseY);
      this.draw();
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.draggedPoint !== null) {
      this.updatePointPosition(this.draggedPoint, mouseX, mouseY);
      this.draw();
    } else {
      const hoveredPoint = this.getClosestPoint(mouseX, mouseY);
      if (hoveredPoint !== this.hoveredPoint) {
        this.hoveredPoint = hoveredPoint;
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
  const mouseX = touch.clientX - rect.left;
  const mouseY = touch.clientY - rect.top;

  this.draggedPoint = this.getPointAtPosition(mouseX, mouseY);
  if (this.draggedPoint !== null) {
    this.updatePointPosition(this.draggedPoint, mouseX, mouseY);
    this.draw();
  }
}

onTouchMove(e) {
  e.preventDefault();
  if (this.draggedPoint !== null) {
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;

    this.updatePointPosition(this.draggedPoint, mouseX, mouseY);
    this.draw();
  }
}

  draw() {
    const ctx = this.ctx;
    const center = this.center;

    // Clear
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

    // Axes radiaux
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8 * Math.PI * 2) - Math.PI / 2;
      const isHovered = this.hoveredPoint === i;
      const isDragged = this.draggedPoint === i;

      ctx.strokeStyle = (isHovered || isDragged)
        ? 'rgba(255, 215, 61, 0.6)'
        : 'rgba(100, 255, 218, 0.25)';
      ctx.lineWidth = (isHovered || isDragged) ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(
        center.x + Math.cos(angle) * this.radius,
        center.y + Math.sin(angle) * this.radius
      );
      ctx.stroke();

      // Numéros
      const labelDist = this.radius + 20;
      const labelX = center.x + Math.cos(angle) * labelDist;
      const labelY = center.y + Math.sin(angle) * labelDist;

      ctx.fillStyle = (isHovered || isDragged)
        ? 'rgba(255, 215, 61, 1)'
        : 'rgba(255, 255, 255, 0.8)';
      ctx.font = (isHovered || isDragged) ? 'bold 16px sans-serif' : 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, labelX, labelY);
    }

    // Connexions entre points (forme)
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const point = this.getPointCoordinates(i);
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // Remplissage
    ctx.fillStyle = 'rgba(100, 255, 218, 0.15)';
    ctx.fill();

    // Point central
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#64ffda';
    ctx.fillStyle = '#64ffda';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Dessiner les points
    for (let i = 0; i < 8; i++) {
      const point = this.getPointCoordinates(i);
      const isHovered = this.hoveredPoint === i;
      const isDragged = this.draggedPoint === i;

      // Lueur
      if (isHovered || isDragged) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = isDragged ? '#ff6b6b' : '#ffd93d';
      } else {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#64ffda';
      }

      // Point extérieur
      ctx.fillStyle = isDragged ? '#ff6b6b' : (isHovered ? '#ffd93d' : '#64ffda');
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.pointSize, 0, Math.PI * 2);
      ctx.fill();

      // Point intérieur
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.pointSize / 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Afficher la valeur
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

export default RadarController;