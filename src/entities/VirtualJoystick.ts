import Phaser from 'phaser';

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base: Phaser.GameObjects.Arc;
  private thumb: Phaser.GameObjects.Arc;
  private baseX: number;
  private baseY: number;
  private radius: number;
  private active = false;
  private pointerId = -1;

  public forceX = 0;
  public forceY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, radius = 60) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;
    this.radius = radius;

    this.base = scene.add.circle(x, y, radius, 0xffffff, 0.15);
    this.base.setStrokeStyle(2, 0xffffff, 0.3);
    this.base.setDepth(200);

    this.thumb = scene.add.circle(x, y, 22, 0xffffff, 0.5);
    this.thumb.setDepth(201);

    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerUp, this);

    this.setVisible(false);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // Only activate if touching left half of screen AND joystick is not already active
    if (this.active) return;
    if (pointer.worldX < this.scene.scale.width / 2) {
      this.active = true;
      this.pointerId = pointer.id;
      this.baseX = pointer.worldX;
      this.baseY = pointer.worldY;
      this.base.setPosition(this.baseX, this.baseY);
      this.thumb.setPosition(this.baseX, this.baseY);
      this.setVisible(true);
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.active || pointer.id !== this.pointerId) return;

    const dx = pointer.worldX - this.baseX;
    const dy = pointer.worldY - this.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.radius) {
      this.thumb.setPosition(this.baseX + dx, this.baseY + dy);
      this.forceX = dx / this.radius;
      this.forceY = dy / this.radius;
    } else {
      const angle = Math.atan2(dy, dx);
      this.thumb.setPosition(
        this.baseX + Math.cos(angle) * this.radius,
        this.baseY + Math.sin(angle) * this.radius,
      );
      this.forceX = Math.cos(angle);
      this.forceY = Math.sin(angle);
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) return;
    this.active = false;
    this.pointerId = -1;
    this.forceX = 0;
    this.forceY = 0;
    this.setVisible(false);
  }

  private setVisible(visible: boolean): void {
    this.base.setVisible(visible);
    this.thumb.setVisible(visible);
  }

  get isActive(): boolean {
    return this.active;
  }

  /** ID of the pointer currently controlling the joystick, or -1 if inactive */
  get trackedPointerId(): number {
    return this.pointerId;
  }
}