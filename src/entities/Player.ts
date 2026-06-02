import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };
  private bullets!: Phaser.Physics.Arcade.Group;
  private lastFired = 0;
  private readonly FIRE_RATE = 200;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bullets: Phaser.Physics.Arcade.Group,
  ) {
    super(scene, x, y, 'soldier');
    this.bullets = bullets;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);

    const kb = scene.input.keyboard!;
    this.cursors = {
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(time: number): void {
    const speed = 160;
    let vx = 0;
    let vy = 0;

    if (this.cursors.a.isDown) vx = -speed;
    if (this.cursors.d.isDown) vx = speed;
    if (this.cursors.w.isDown) vy = -speed;
    if (this.cursors.s.isDown) vy = speed;

    // Normalise diagonal movement
    if (vx !== 0 && vy !== 0) {
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    this.setVelocity(vx, vy);

    // Aim towards mouse
    const pointer = this.scene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
    this.setRotation(angle);

    // Shoot
    if (pointer.isDown && time - this.lastFired > this.FIRE_RATE) {
      this.fire(time, angle);
    }
  }

  private fire(time: number, angle: number): void {
    this.lastFired = time;

    const bullet = this.bullets.get(this.x, this.y, 'bullet') as Phaser.Physics.Arcade.Sprite | null;
    if (!bullet) return;

    bullet.setActive(true).setVisible(true);
    bullet.setRotation(angle);
    bullet.setVelocity(
      Math.cos(angle) * 500,
      Math.sin(angle) * 500,
    );
    bullet.setDepth(5);
  }
}