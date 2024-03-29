import Phaser from 'phaser';
import isEqual from 'deep-equal';

import players from '../utils/_players';
import ships from '../utils/ships';
import { getEmail } from '../../../../utils/auth';

const leftStartFrame = 11;
const leftEndFrame = 18;

const rightStartFrame = 1;
const rightEndFrame = 10;

const PlayerSpeed = 400;
const BgSpeed = 1.5;

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'game' });

    this.state = {
      id: '',
      left: false,
      right: false,
      x: 23,
      trackId: ''
    };

    this.commonContext = {};
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  preload() {
    this.load.image('planet:moon', '/assets/game/planets/moon.png');
    this.load.image('planet:agebeeny', '/assets/game/planets2/agebeeny.png');
    this.load.image('planet:earth', '/assets/game/planets2/earth.png');
    this.load.image('planet:feros', '/assets/game/planets/feros.png');
    this.load.image('planet:illium', '/assets/game/planets2/illium.png');
    this.load.image('planet:noveria', '/assets/game/planets/noveria.png');
    this.load.image('planet:toontaw', '/assets/game/planets/toontaw.png');
    this.load.image('planet:tuchanka', '/assets/game/planets2/tuchanka.png');
    this.load.image('planet:planet1', '/assets/game/planets3/planet1.png');
    this.load.image('planet:planet2', '/assets/game/planets3/planet2.png');
    this.load.image('planet:planet3', '/assets/game/planets3/planet3.png');

    this.load.image('asteroid-1', '/assets/game/asteroids/asteroid-1.png');
    this.load.image('asteroid-2', '/assets/game/asteroids/asteroid-2.png');
    this.load.image('asteroid-3', '/assets/game/asteroids/asteroid-3.png');
    this.load.image('asteroid-4', '/assets/game/asteroids/asteroid-4.png');
    this.load.image('asteroid-5', '/assets/game/asteroids/asteroid-5.png');
    this.load.image('asteroid-6', '/assets/game/asteroids/asteroid-6.png');

    this.load.image('space', '/assets/game/background/space4.png');
    this.load.image('space2', '/assets/game/background/space3-1.png');
    this.load.image('space3', '/assets/game/background/space3-2.png');
    this.load.image('hole', '/assets/game/background/hole.png');

    this.load.spritesheet('nova', '/assets/game/ships/nova.png', { frameWidth: 130, frameHeight: 132 });
    this.load.spritesheet('omega', '/assets/game/ships/omega.png', { frameWidth: 130, frameHeight: 132 });
    this.load.spritesheet('ship1', 'assets/game/ships/ship1.png', { frameWidth: 127, frameHeight: 130 });
  }

  create(data) {
    this.players = this.physics.add.group();
    this.planets = this.add.group();

    this.backgroundSpace = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'space').setOrigin(0);
    this.backgroundSpace2 = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'space2').setOrigin(0);
    this.backgroundSpace3 = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'space3').setOrigin(0);
    this.planets.agebeeny = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'planet:agebeeny').setOrigin(0);
    this.planets.illium = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'planet:illium').setOrigin(0);
    this.planets.tuchanka = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'planet:tuchanka').setOrigin(0);
    this.planets.earth = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'planet:earth').setOrigin(0);
    this.planets.planet1 = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'planet:planet1').setOrigin(0);
    this.planets.planet2 = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'planet:planet2').setOrigin(0);
    this.planets.planet3 = this.add.tileSprite(0, 0, this.screenWidth, this.screenHeight, 'planet:planet3').setOrigin(0);
    this.moon = this.add.tileSprite((this.screenWidth / 2) - 180, -180, 360, 360, 'planet:moon').setOrigin(0);

    // const percHeight = (window.innerHeight - 180 - 130) / 100;
    // const percWidth = (window.innerWidth) / 100;
    players.spawnPlayers(this, data.players);

    //  Input Events
    this.commonContext.cursors = this.input.keyboard.createCursorKeys();

    this.state.id = data.players[0].id;
    this.state.id = data.players.filter((player) => player.email === getEmail())[0].id;
    this.state.trackId = data.trackId;

    window.socket.on('moveXupdate', (data) => {
      const player = this.players.children.get('id', data.id);

      // TODO fix animation keys

      if (data.left) {
        player.setVelocityX(-1 * PlayerSpeed);

        if (!player.anims.currentFrame || player.anims.currentAnim.key !== 'left' || player.anims.currentFrame.index < 8) {
          player.anims.play(`${player.id}_left`, true);
        } else {
          player.anims.stop(`${player.id}_left`);
        }
      } else if (data.right) {
        player.setVelocityX(PlayerSpeed);

        if (!player.anims.currentFrame || player.anims.currentAnim.key !== 'right' || player.anims.currentFrame.index < 10) {
          player.anims.play(`${player.id}_right`, true);
        } else {
          player.anims.stop(`${player.id}_right`);
        }
      } else {
        player.setVelocityX(0);

        if (leftStartFrame < player.frame.name && player.frame.name <= leftEndFrame) {
          player.anims.play(`${player.id}_left_back`, true);
        } else if (rightStartFrame < player.frame.name && player.frame.name <= rightEndFrame) {
          player.anims.play(`${player.id}_right_back`, true);
        } else {
          player.anims.stop(`${player.id}_left_back`);
          player.anims.stop(`${player.id}_right_back`);
          player.setFrame(0);
        }
      }
    });

    window.socket.on('positionUpdate', (data) => {
      const percentHight = (window.innerHeight - 180 - 130) / 100;
      const getY = (position) =>
        (position === 0 ? (30 * percentHight) + 180 : (60 * percentHight) + 180);
      data.forEach((dat) => {
        if (dat.id === this.player.id) {
          this.player.y = getY(dat.position);
        } else {
          this.enemies.children.entries[0].y = getY(dat.position);
        }
      });
    });
  }

  update() {
    const newState = {
      id: this.state.id,
      left: false,
      right: false,
      x: 23,
      trackId: this.state.trackId
    };

    // const player = this.players.children.get('id', this.state.id);

    if (this.commonContext.cursors.left.isDown) {
      newState.left = true;
      newState.right = false;

      // if (!player.anims.currentFrame || player.anims.currentAnim.key !== 'left' || player.anims.currentFrame.index < 8) {
      //   player.anims.play(`${player.id}_left`, true);
      // } else {
      //   player.anims.stop(`${player.id}_left`);
      // }

      // if (!this.player.anims.currentFrame || this.player.anims.currentAnim.key !== 'player_left' || this.player.anims.currentFrame.index < 8) {
      //   this.player.anims.play('player_left', true);
      // } else {
      //   this.player.anims.stop('player_left');
      // }
    } else if (this.commonContext.cursors.right.isDown) {
      newState.left = false;
      newState.right = true;

      // if (!player.anims.currentFrame || player.anims.currentAnim.key !== 'right' || player.anims.currentFrame.index < 10) {
      //   player.anims.play(`${player.id}_right`, true);
      // } else {
      //   player.anims.stop(`${player.id}_right`);
      // }

      // if (!this.player.anims.currentFrame || this.player.anims.currentAnim.key !== 'player_right' || this.player.anims.currentFrame.index < 10) {
      //   this.player.anims.play('player_right', true);
      // } else {
      //   this.player.anims.stop('player_right');
      // }
    } else {
      newState.left = false;
      newState.right = false;

      // if (leftStartFrame < player.frame.name && player.frame.name <= leftEndFrame) {
      //   player.anims.play(`${player.id}_left_back`, true);
      // } else if (rightStartFrame < player.frame.name && player.frame.name <= rightEndFrame) {
      //   player.anims.play(`${player.id}_right_back`, true);
      // } else {
      //   player.anims.stop(`${player.id}_left_back`);
      //   player.anims.stop(`${player.id}_right_back`);
      //   player.setFrame(0);
      // }

      // if (leftStartFrame < this.player.frame.name
      //   && this.player.frame.name <= leftEndFrame) {
      //   this.player.anims.play('player_left_back', true);
      // } else if (rightStartFrame < this.player.frame.name
      //   && this.player.frame.name <= rightEndFrame) {
      //   this.player.anims.play('player_right_back', true);
      // } else {
      //   this.player.anims.stop('player_left_back');
      //   this.player.anims.stop('player_right_back');
      //   this.player.setFrame(0);
      // }
    }

    if (!isEqual(this.state, newState)) {
      this.state.left = newState.left;
      this.state.right = newState.right;
      window.socket.emit('moveX', this.state);
      console.log('emit', this.state);
    }

    const getRandY = () => (Math.random() * (0.5 - 1.5)) + 1;
    const getRandX = () => (Math.random() * (0.01 - 0.1)) + 0.1;

    this.backgroundSpace.tilePositionY -= BgSpeed;
    this.backgroundSpace2.tilePositionY -= BgSpeed * 1.5;
    this.backgroundSpace3.tilePositionY -= BgSpeed * 2;
    this.planets.agebeeny.tilePositionY -= getRandY();
    this.planets.agebeeny.tilePositionX -= getRandX();
    this.planets.illium.tilePositionY -= getRandY();
    this.planets.illium.tilePositionX += getRandX();
    this.planets.tuchanka.tilePositionY -= getRandY();
    this.planets.tuchanka.tilePositionX -= getRandX();
    this.planets.earth.tilePositionY -= getRandY();
    this.planets.earth.tilePositionX += getRandX();
    this.planets.planet1.tilePositionY -= getRandY();
    this.planets.planet1.tilePositionX -= getRandX();
    this.planets.planet2.tilePositionY -= getRandY();
    this.planets.planet2.tilePositionX -= getRandX();
    this.planets.planet3.tilePositionY -= getRandY();
    this.planets.planet3.tilePositionX -= getRandX();
  }
}
