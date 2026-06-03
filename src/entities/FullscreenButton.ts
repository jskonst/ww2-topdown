import Phaser from 'phaser';

export class FullscreenButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private icon: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // semi-transparent background circle
    this.bg = scene.add.rectangle(0, 0, 40, 40, 0x000000, 0.4)
      .setStrokeStyle(1, 0xffffff, 0.3);
    this.add(this.bg);

    // fullscreen icon (⛶ or ⛶ using unicode)
    this.icon = scene.add.text(0, 0, '⛶', {
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.add(this.icon);

    this.setSize(44, 44);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => {
      this.toggleFullscreen();
    });

    this.setDepth(200);

    // listen for fullscreen changes to update icon
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));

    scene.add.existing(this);
  }

  private onFullscreenChange(): void {
    const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
    this.icon.setText(isFull ? '⛶' : '⛶');
    this.bg.setFillStyle(0x000000, isFull ? 0.6 : 0.4);
  }

  private toggleFullscreen(): void {
    const el = this.scene.scale.canvas;
    const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);

    if (isFull) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } else {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    }
  }

  destroy(fromScene?: boolean): void {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    super.destroy(fromScene);
  }
}