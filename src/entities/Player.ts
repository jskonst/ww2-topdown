import Phaser from 'phaser';
import { VirtualJoystick } from './VirtualJoystick';

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
  private joystick!: VirtualJoystick;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bullets: Phaser.Physics.Arcade.Group,
    joystick: VirtualJoystick,
  ) {
    super(scene, x, y, 'soldier');
    this.bullets = bullets;
    this.joystick = joystick;

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

    // Keyboard input (desktop)
    const kbInput = this.getKeyboardInput();
    if (kbInput.vx !== 0 || kbInput.vy !== 0) {
      vx = kbInput.vx;
      vy = kbInput.vy;
    } else if (this.joystick.isActive) {
      // Joystick input (mobile)
      vx = this.joystick.forceX * speed;
      vy = this.joystick.forceY * speed;
    }

    this.setVelocity(vx, vy);

    // Aim: towards mouse on desktop, towards joystick direction on mobile
    const pointer = this.scene.input.activePointer;
    const pointerInRightHalf = pointer.worldX >= this.scene.scale.width / 2;
    const joystickMoving = this.joystick.forceX !== 0 || this.joystick.forceY !== 0;

    if (this.joystick.isActive) {
      // Mobile: face always in movement direction
      if (joystickMoving) {
        const moveAngle = Math.atan2(this.joystick.forceY, this.joystick.forceX);
        this.setRotation(moveAngle);
      }
      // Fire towards tap on right half (auto-fire while held)
      if (pointerInRightHalf && pointer.isDown) {
        const shootAngle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        if (time - this.lastFired > this.FIRE_RATE) {
          this.fire(time, shootAngle);
        }
      }
    } else {
      // Desktop: aim at mouse cursor
      const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
      this.setRotation(angle);
      if (pointer.isDown && time - this.lastFired > this.FIRE_RATE) {
        this.fire(time, angle);
      }
    }
  }

  private getKeyboardInput(): { vx: number; vy: number } {
    const speed = 160;
    let vx = 0;
    let vy = 0;

    if (this.cursors.a.isDown) vx = -speed;
    if (this.cursors.d.isDown) vx = speed;
    if (this.cursors.w.isDown) vy = -speed;
    if (this.cursors.s.isDown) vy = speed;

    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    return { vx, vy };
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