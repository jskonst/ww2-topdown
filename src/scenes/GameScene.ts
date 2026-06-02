import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private playerHealth = 5;
  private enemySpawnTimer = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.generateTextures();
    this.drawBackground();
    this.createWalls();

    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30,
    });

    this.enemies = this.physics.add.group();

    this.player = new Player(this, 480, 320, this.bullets);

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.onBulletHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.onEnemyHitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);

    this.scoreText = this.add.text(16, 16, 'Убито: 0', {
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(100);

    this.healthText = this.add.text(800, 16, '❤️ x5', {
      fontSize: '20px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(100);
  }

  update(time: number): void {
    this.player.update(time);

    if (time - this.enemySpawnTimer > 2000) {
      this.spawnEnemy();
      this.enemySpawnTimer = time;
    }

    this.bullets.getChildren().forEach((b) => {
      const bullet = b as Phaser.Physics.Arcade.Sprite;
      if (!bullet.active) return;
      if (bullet.x < -50 || bullet.x > 1010 || bullet.y < -50 || bullet.y > 690) {
        bullet.setActive(false).setVisible(false);
        const body = bullet.body as Phaser.Physics.Arcade.Body | null;
        if (body) body.enable = false;
      }
    });

    this.enemies.getChildren().forEach((e) => {
      const enemy = e as Phaser.Physics.Arcade.Sprite;
      if (!enemy.active) return;
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      enemy.setRotation(angle);
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      this.physics.velocityFromRotation(angle, 80, body.velocity);
    });
  }

  private generateTextures(): void {
    const soldierGfx = this.make.graphics({ x: 0, y: 0 }, false);
    soldierGfx.fillStyle(0x4a6b2a);
    soldierGfx.fillRect(8, 14, 16, 22);
    soldierGfx.fillStyle(0xdbb87b);
    soldierGfx.fillCircle(16, 10, 7);
    soldierGfx.fillStyle(0x5a7a3a);
    soldierGfx.fillRect(9, 3, 14, 5);
    soldierGfx.fillStyle(0x4a6b2a);
    soldierGfx.fillRect(4, 16, 24, 4);
    soldierGfx.fillStyle(0x3a4a2a);
    soldierGfx.fillRect(10, 36, 5, 10);
    soldierGfx.fillRect(17, 36, 5, 10);
    soldierGfx.fillStyle(0x3a2a1a);
    soldierGfx.fillRect(9, 44, 7, 4);
    soldierGfx.fillRect(16, 44, 7, 4);
    soldierGfx.fillStyle(0x6a5a3a);
    soldierGfx.fillRect(30, 18, 16, 3);
    soldierGfx.fillRect(40, 16, 3, 7);
    soldierGfx.generateTexture('soldier', 48, 48);
    soldierGfx.destroy();

    const enemyGfx = this.make.graphics({ x: 0, y: 0 }, false);
    enemyGfx.fillStyle(0x5a3a2a);
    enemyGfx.fillRect(8, 14, 16, 22);
    enemyGfx.fillStyle(0xbb8877);
    enemyGfx.fillCircle(16, 10, 7);
    enemyGfx.fillStyle(0x4a3a2a);
    enemyGfx.fillRect(9, 3, 14, 5);
    enemyGfx.fillStyle(0x5a3a2a);
    enemyGfx.fillRect(4, 16, 24, 4);
    enemyGfx.fillStyle(0x4a3a2a);
    enemyGfx.fillRect(10, 36, 5, 10);
    enemyGfx.fillRect(17, 36, 5, 10);
    enemyGfx.fillStyle(0x3a2a1a);
    enemyGfx.fillRect(9, 44, 7, 4);
    enemyGfx.fillRect(16, 44, 7, 4);
    enemyGfx.generateTexture('enemy', 48, 48);
    enemyGfx.destroy();

    const bulletGfx = this.make.graphics({ x: 0, y: 0 }, false);
    bulletGfx.fillStyle(0xffcc00);
    bulletGfx.fillCircle(4, 4, 4);
    bulletGfx.fillStyle(0xffffff);
    bulletGfx.fillCircle(4, 4, 2);
    bulletGfx.generateTexture('bullet', 8, 8);
    bulletGfx.destroy();

    const wallGfx = this.make.graphics({ x: 0, y: 0 }, false);
    wallGfx.fillStyle(0x6a5a3a);
    wallGfx.fillRect(0, 0, 48, 48);
    wallGfx.lineStyle(2, 0x5a4a2a);
    wallGfx.strokeRect(1, 1, 46, 46);
    wallGfx.lineBetween(0, 0, 48, 48);
    wallGfx.lineBetween(48, 0, 0, 48);
    wallGfx.generateTexture('wall', 48, 48);
    wallGfx.destroy();
  }

  private drawBackground(): void {
    const gfx = this.add.graphics();
    const tileSize = 32;
    for (let x = 0; x < 960; x += tileSize) {
      for (let y = 0; y < 640; y += tileSize) {
        const shade = (x / tileSize + y / tileSize) % 2 === 0 ? 0x4a7a3a : 0x4d7e3d;
        gfx.fillStyle(shade);
        gfx.fillRect(x, y, tileSize, tileSize);
      }
    }
    gfx.setDepth(0);
  }

  private createWalls(): void {
    this.walls = this.physics.add.staticGroup();

    this.walls.create(480, -24, 'wall')?.setScale(20, 1)?.refreshBody();
    this.walls.create(480, 664, 'wall')?.setScale(20, 1)?.refreshBody();
    this.walls.create(-24, 320, 'wall')?.setScale(1, 14)?.refreshBody();
    this.walls.create(984, 320, 'wall')?.setScale(1, 14)?.refreshBody();

    const positions = [
      [200, 200], [760, 200], [480, 100],
      [200, 480], [760, 480], [480, 540],
      [100, 320], [860, 320],
      [340, 320], [620, 320],
    ] as const;
    for (const [x, y] of positions) {
      this.walls.create(x, y, 'wall')?.setScale(2)?.refreshBody();
    }

    this.walls.setDepth(1);
  }

  private spawnEnemy(): void {
    if (this.enemies.countActive() >= 8) return;

    const edge = Phaser.Math.Between(0, 3);
    let x: number, y: number;
    switch (edge) {
      case 0: x = Phaser.Math.Between(50, 910); y = -30; break;
      case 1: x = Phaser.Math.Between(50, 910); y = 670; break;
      case 2: x = -30; y = Phaser.Math.Between(50, 590); break;
      default: x = 990; y = Phaser.Math.Between(50, 590); break;
    }

    const enemy = this.enemies.create(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;
    enemy.setDepth(9);
    enemy.setCollideWorldBounds(true);
  }

  private onBulletHitEnemy(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  ): void {
    const bullet = obj1 as Phaser.Physics.Arcade.Sprite;
    const enemy = obj2 as Phaser.Physics.Arcade.Sprite;

    bullet.setActive(false).setVisible(false);
    const body = bullet.body as Phaser.Physics.Arcade.Body | null;
    if (body) body.enable = false;

    enemy.destroy();

    this.score += 1;
    this.scoreText.setText(`Убито: ${this.score}`);
  }

  private onEnemyHitPlayer(
    _obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  ): void {
    if (!this.player.active) return;

    this.playerHealth--;
    this.healthText.setText(`❤️ x${this.playerHealth}`);

    const enemy = _obj2 as Phaser.Physics.Arcade.Sprite;
    enemy.destroy();

    this.player.setTintFill(0xff0000);
    this.time.delayedCall(150, () => {
      if (this.player.active) this.player.clearTint();
    });

    if (this.playerHealth <= 0) {
      this.scene.restart();
    }
  }
}