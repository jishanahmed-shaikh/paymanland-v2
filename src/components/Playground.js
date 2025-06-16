import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import GameShop from './GameShop';
import WalletConnect from './WalletConnect';
import ChatInterface from './ChatInterface';
// import PaymanDebug from './PaymanDebug'; // Commented out for production
import '../animations.css';

function Playground() {
  const location = useLocation();
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const gameInstance = useRef(null);
  const [speed, setSpeed] = useState(200);
  const [showShop, setShowShop] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Add this effect to handle game pause when chat is open
  useEffect(() => {
    if (!gameInstance.current) return;

    const keyboard = gameInstance.current.input && gameInstance.current.input.keyboard;
    if (keyboard) {
      if (showChat) {
        // Pause the game's input when chat is open
        keyboard.enabled = false;
        keyboard.preventDefault = true;
      } else {
        // Re-enable game input when chat is closed
        keyboard.enabled = true;
        keyboard.preventDefault = false;
      }
    }
  }, [showChat]);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameInstance.current = game;

    let player;
    let cursors;
    let buildings;
    let enterButton;
    let npcs;
    let chatButton;
    let currentNPC = null;
    let signProximityChecked = false;

    const WORLD_WIDTH = 3840;
    const WORLD_HEIGHT = 2560;
    
    // Constants for the Payman Land sign
    const SIGN_POSITION = {
      x: WORLD_WIDTH / 7,
      y: WORLD_HEIGHT / 4 + 10
    };

    function checkSignProximity() {
      if (!player) return;
      
      const distance = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        SIGN_POSITION.x,
        SIGN_POSITION.y
      );
      
      if (distance < 300 && !signProximityChecked) {
        setShowWelcomePopup(true);
        signProximityChecked = true;
      } else if (distance >= 300) {
        signProximityChecked = false;
        setShowWelcomePopup(false);
      }
    }

    function preload() {
      this.load.image('avatar', location.state.avatarImage);
      this.load.image('background', '/assets/bgplayground.jpg');
      this.load.image('enterButton', '/assets/tree.png');
      this.load.image('avatar-front', '/assets/ashfront.png');
      this.load.image('avatar-back', '/assets/ashback.png');
      this.load.image('avatar-left', '/assets/ashleft.png');
      this.load.image('avatar-right', '/assets/ashright.png');
      // Load NPC avatars
      this.load.image('sherif', '/assets/sherif.png');
      this.load.image('traditional', '/assets/traditionalwearindianavatar.png');
      this.load.image('trekker', '/assets/trekker.png');
    }

    function create() {
      // Add background
      const background = this.add.image(0, 0, 'background');
      background.setOrigin(0, 0);
      background.setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT);

      // Create the Payman Land sign
      const signContainer = this.add.container(SIGN_POSITION.x, SIGN_POSITION.y);
      
      // Create the letters for "PAYMAN LAND" with 3D effect
      const letters = "PAYMAN LAND".split('').map((letter, index) => {
        const x = (index - 5) * 50; // Slightly increased spacing
        const y = 0;
        
        // Create multiple layers for 3D effect
        const layers = [];
        
        // Add depth layers (back to front)
        for(let depth = 3; depth >= 0; depth--) {
          const layerText = this.add.text(x + depth * 2, y + depth * 2, letter, {
            fontFamily: 'Arial Black',
            fontSize: '60px', // Increased font size
            color: depth === 0 ? '#ffffff' : '#2d7794',
            fontStyle: 'bold'
          });
          layerText.setOrigin(0.5);
          // Add slight random rotation for that classic look
          const rotation = Phaser.Math.Between(-2, 2) * Math.PI / 180;
          layerText.setRotation(rotation);
          layers.push(layerText);
        }
        
        // Add final front layer with stroke for extra definition
        const frontLayer = this.add.text(x, y, letter, {
          fontFamily: 'Arial Black',
          fontSize: '60px', // Increased font size
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#2d7794',
          strokeThickness: 2, // Increased stroke thickness
          shadow: { color: '#000000', blur: 2, offsetX: 1, offsetY: 1 }
        });
        frontLayer.setOrigin(0.5);
        frontLayer.setRotation(layers[0].rotation);
        layers.push(frontLayer);
        
        return layers;
      });
      
      // Add all letter layers to the container
      signContainer.add(letters.flat());
      
      // Add some perspective to the entire sign
      signContainer.setDepth(1);
      signContainer.setScale(1.3);  // Increased overall scale
      signContainer.setRotation(-12 * Math.PI / 180); // Adjusted rotation angle

      // Create player with initial front-facing sprite
      player = this.physics.add.sprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'avatar-front');
      player.setCollideWorldBounds(true);
      player.setScale(0.4);

      cursors = this.input.keyboard.createCursorKeys();

      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.startFollow(player, true, 0.1, 0.1);
      this.cameras.main.setZoom(0.5);

      // Define building locations and data
      const buildingData = [
        { 
          x: 1720, 
          y: 1600, 
          name: 'Fashion Store', 
          categories: {
            "Trending": [
              { 
                name: 'Premium T-Shirt', 
                description: 'Ultra-soft premium cotton t-shirt with a modern fit. Breathable fabric keeps you comfortable all day long.', 
                price: '$24.99', 
                buyLink: 'https://www.amazon.in/Amazon-Brand-Symbol-Mens-AW17MPCP9_XL_Tango/dp/B073X33F63', 
                upvotes: 382, 
                image: 'https://m.media-amazon.com/images/I/71G7DJG+dqL._SY741_.jpg' 
              },
              { 
                name: 'Slim-Fit Jeans', 
                description: 'Classic blue slim-fit jeans with stretch technology. Perfect blend of style and comfort for everyday wear.', 
                price: '$49.99', 
                buyLink: 'https://www.amazon.in/Louis-Philippe-Mens-Jeans-LRDNCSLPL62630_Navy/dp/B0D4Z323HB', 
                upvotes: 287, 
                image: 'https://m.media-amazon.com/images/I/61r7htRqqDL._SY879_.jpg' 
              },
            ],
            "New Arrivals": [
              { 
                name: 'Winter Jacket', 
                description: 'Stylish winter jacket with thermal insulation. Water-resistant outer layer keeps you dry and warm in all conditions.', 
                price: '$89.99', 
                buyLink: 'https://www.amazon.in/Pomo-Z-Polyester-Casual-Stylish-Removable/dp/B0CHHRTWGW/', 
                upvotes: 125, 
                image: 'https://m.media-amazon.com/images/I/71-ngFIxUlL._SX679_.jpg' 
              },
              {
                name: 'Dress Shirt',
                description: 'Elegant formal dress shirt made from premium cotton. Perfect for business meetings or special occasions.',
                price: '$59.99',
                buyLink: 'https://www.amazon.in/Arrow-Mens-Printed-Regular-ASRRF3346_White_42/dp/B07L5RK4W9/',
                upvotes: 94,
                image: 'https://m.media-amazon.com/images/I/71Svj6aqIzL._SY741_.jpg'
              }
            ],
            "Casual Wear": [
              {
                name: 'Hooded Sweatshirt',
                description: 'Comfortable hoodie perfect for casual outings. Features a kangaroo pocket and adjustable drawstring hood.',
                price: '$39.99',
                buyLink: 'https://www.amazon.in/Alan-Jones-Clothing-Cotton-Hooded/dp/B07D4XF464/',
                upvotes: 178,
                image: 'https://m.media-amazon.com/images/I/61K2EFxk79L._SY741_.jpg'
              },
              {
                name: 'Cargo Pants',
                description: 'Versatile cargo pants with multiple pockets. Durable construction for outdoor activities and everyday wear.',
                price: '$45.99',
                buyLink: 'https://www.amazon.in/GEUM-Relaxed-Casual-Cotton-Regular/dp/B0CZ6YJ75D/',
                upvotes: 156,
                image: 'https://m.media-amazon.com/images/I/71vHtdVe9tL._SY741_.jpg'
              }
            ]
          }
        },
        { 
          x: 1550, 
          y: 1650, 
          name: 'Shoe Shop', 
          categories: {
            "Trending": [
              { 
                name: 'Running Sneakers', 
                description: 'Lightweight running shoes with advanced cushioning technology. Perfect for daily jogs or marathon training.', 
                price: '$79.99', 
                buyLink: 'https://www.amazon.in/Campus-Mens-Running-Shoes-7-CG-203/dp/B0B292FQ81/', 
                upvotes: 193,
                image: 'https://m.media-amazon.com/images/I/61+r3+JwxSL._SY625_.jpg'
              },
              { 
                name: 'Leather Boots', 
                description: 'Premium leather boots with durable construction. Water-resistant and perfect for all weather conditions.', 
                price: '$99.99', 
                buyLink: 'https://www.amazon.in/Red-Chief-Rust-Leather-Boots/dp/B0859NKF5L/',
                upvotes: 178,
                image: 'https://m.media-amazon.com/images/I/41yr4QQs81L.jpg'
              }
            ],
            "Casual": [
              {
                name: 'Canvas Sneakers',
                description: 'Classic canvas sneakers for a timeless look. Comfortable for all-day wear with durable rubber soles.',
                price: '$54.99',
                buyLink: 'https://www.amazon.in/Puma-Unisex-Sneaker-382303-White-Ribbon/dp/B08CDNLH8N/',
                upvotes: 145,
                image: 'https://m.media-amazon.com/images/I/71E75yRwCDL._SY625_.jpg'
              },
              {
                name: 'Slip-on Loafers',
                description: 'Elegant slip-on loafers with memory foam insoles. Perfect blend of comfort and style for casual occasions.',
                price: '$64.99',
                buyLink: 'https://www.amazon.in/FAUSTO-Mens-Loafers-Moccasins-F49/dp/B07BR1D161/',
                upvotes: 132,
                image: 'https://m.media-amazon.com/images/I/71Nmn3aXUFL._SY625_.jpg'
              }
            ],
            "Sports": [
              {
                name: 'Basketball Shoes',
                description: 'High-performance basketball shoes with ankle support. Enhanced grip for quick movements on the court.',
                price: '$89.99',
                buyLink: 'https://www.amazon.in/Adidas-Unisex-Adult-Ownthegame-Basketball/dp/B07S62DVKY/',
                upvotes: 167,
                image: 'https://m.media-amazon.com/images/I/71Iot-pQ6YL._SY695_.jpg'
              },
              {
                name: 'Football Cleats',
                description: 'Professional football cleats designed for optimal traction. Lightweight construction for speed and agility.',
                price: '$74.99',
                buyLink: 'https://www.amazon.in/Football-Soccer-Non-Slip-Training-Outdoor/dp/B09XBP32R7/',
                upvotes: 109,
                image: 'https://m.media-amazon.com/images/I/51bItK0a1JL._SY695_.jpg'
              }
            ]
          }
        },
        { 
          x: 2240, 
          y: 740, 
          name: 'Accessories', 
          categories: {
            "Trending": [
              { 
                name: 'Polarized Sunglasses', 
                description: 'Premium polarized sunglasses with UV400 protection. Lightweight frame with durable construction.', 
                price: '$39.99', 
                buyLink: 'https://www.amazon.in/Vincent-Chase-Eyewear-Polarized-Sunglasses/dp/B08R74PJKK/', 
                upvotes: 156,
                image: 'https://m.media-amazon.com/images/I/51terQSLFrL._SY695_.jpg'
              },
              { 
                name: 'Chronograph Watch', 
                description: 'Elegant chronograph watch with stainless steel band. Water-resistant up to 50m with luminous hands.', 
                price: '$149.99', 
                buyLink: 'https://www.amazon.in/Timex-Chronograph-Black-Watch-TW000Y404/dp/B07H3K85H5/',
                upvotes: 171,
                image: 'https://m.media-amazon.com/images/I/71OrsAUDJiL._SY741_.jpg'
              }
            ],
            "Top Picks": [
              { 
                name: 'Leather Wallet', 
                description: 'Genuine leather wallet with RFID blocking technology. Multiple card slots and convenient coin pocket.', 
                price: '$29.99', 
                buyLink: 'https://www.amazon.in/Hornbull-Buttler-Genuine-Leather-Blocking/dp/B074DZ8YP5/',
                upvotes: 149,
                image: 'https://m.media-amazon.com/images/I/71o0X4k3-FL._SY695_.jpg'
              },
              {
                name: 'Laptop Backpack',
                description: 'Anti-theft laptop backpack with USB charging port. Padded compartments for electronics and multiple organization pockets.',
                price: '$59.99',
                buyLink: 'https://www.amazon.in/Fur-Jaden-Anti-Theft-Backpack-Charging/dp/B07G4LJKGV/',
                upvotes: 187,
                image: 'https://m.media-amazon.com/images/I/71pfQBLbPaL._SX679_.jpg'
              }
            ],
            "Jewelry": [
              {
                name: 'Silver Chain Necklace',
                description: 'Sterling silver chain necklace with modern design. Hypoallergenic material suitable for everyday wear.',
                price: '$45.99',
                buyLink: 'https://www.amazon.in/Shining-Diva-Fashion-Crystal-Necklace/dp/B07418KYCT/',
                upvotes: 112,
                image: 'https://m.media-amazon.com/images/I/617TXtrIajL._SY695_.jpg'
              },
              {
                name: 'Elegant Bracelet',
                description: 'Adjustable bracelet with crystal embellishments. Perfect accessory for both casual and formal occasions.',
                price: '$35.99',
                buyLink: 'https://www.amazon.in/Yellow-Chimes-Bracelet-Crystals-Girlfriend/dp/B075MH3RB5/',
                upvotes: 98,
                image: 'https://m.media-amazon.com/images/I/71mNMQBVPpL._SY695_.jpg'
              }
            ]
          }
        }
      ];

      // Create buildings
      buildings = this.physics.add.staticGroup();
      buildingData.forEach((building) => {
        // Create invisible interactive area
        const buildingSprite = this.add.rectangle(building.x, building.y, 100, 100, 0x0000ff, 0)
          .setInteractive()
          .setData('buildingInfo', building);

        // Add building name with enhanced styling
        const nameText = this.add.text(building.x, building.y - 70, building.name, {
          fontSize: '20px',
          fontFamily: 'Arial',
          fill: '#2d7794',
          backgroundColor: '#ffffff',
          padding: { x: 10, y: 5 },
          borderRadius: 10,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            fill: true
          }
        }).setOrigin(0.5);

        // Add a subtle animation to the name
        this.tweens.add({
          targets: nameText,
          y: nameText.y - 5,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        buildings.add(buildingSprite);
      });

      // Create NPCs
      npcs = this.physics.add.staticGroup();
      
      const npcData = [
        { 
          x: WORLD_WIDTH / 2 - 400, 
          y: WORLD_HEIGHT / 2 - 300, 
          sprite: 'sherif',
          name: 'Sheriff John',
          dialogue: [
            "Welcome to our virtual world!",
            "I'm here to help keep everyone safe.",
            "Feel free to explore around!"
          ]
        },
        { 
          x: WORLD_WIDTH / 2 + 400, 
          y: WORLD_HEIGHT / 2 - 200, 
          sprite: 'traditional',
          name: 'Priya Sharma',
          dialogue: [
            "Namaste! Welcome to our community!",
            "I can tell you all about our local customs.",
            "Would you like to learn more?"
          ]
        },
        {
          x: SIGN_POSITION.x + 250, // Moved further right
          y: SIGN_POSITION.y - 180, // Moved higher up
          sprite: 'trekker',
          name: 'Wise Trekker',
          scale: 0.6, // Reduced scale even more
          dialogue: [
            "Greetings, fellow adventurer!",
            "Life is like this mountain we're standing on - full of challenges and beautiful views.",
            "What would you like to know about life's journey?"
          ]
        }
      ];

      npcData.forEach((npc) => {
        const npcSprite = this.physics.add.sprite(npc.x, npc.y, npc.sprite);
        npcSprite.setScale(npc.scale || 1.1); // Use specific scale if provided, otherwise default to 1.1
        npcSprite.setImmovable(true);
        npcSprite.setData('npcInfo', npc);
        
        // Adjust text position and size for Trekker
        const nameY = npc.name === 'Wise Trekker' ? npc.y - 40 : npc.y - 70;
        this.add
          .text(npc.x, nameY, npc.name, {
            fontSize: npc.name === 'Wise Trekker' ? '16px' : '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 },
          })
          .setOrigin(0.5);

        npcs.add(npcSprite);
      });

      // Create the styled enter button (initially hidden)
      enterButton = this.add.text(0, 0, 'Enter to this shop', {
        fontSize: '24px',
        fontFamily: '"Arial", sans-serif',
        color: '#ffffff',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setStyle({
        backgroundColor: '#2d7794',
        color: '#ffffff',
        borderRadius: '20px',
        padding: '15px 30px',
        border: '2px solid #ffffff',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
        boxShadow: '0 4px 8px rgba(45, 119, 148, 0.3)',
      })
      .on('pointerdown', showShopPopup);

      enterButton.on('pointerover', () => {
        enterButton.setStyle({
          backgroundColor: '#1e5c7a',
          transform: 'scale(1.05)',
        });
      });
      
      enterButton.on('pointerout', () => {
        enterButton.setStyle({
          backgroundColor: '#2d7794',
          transform: 'scale(1)',
        });
      });
    


// Resize event listener
      this.scale.on('resize', (gameSize) => {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
      });

      // Create chat button (initially hidden)
      chatButton = this.add.text(0, 0, 'Chat with NPC', {
        fontSize: '24px',
        fontFamily: '"Arial", sans-serif',
        color: '#ffffff',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setStyle({
        backgroundColor: '#4a90e2',
        color: '#ffffff',
        borderRadius: '20px',
        padding: '15px 30px',
        border: '2px solid #ffffff',
      })
      .on('pointerdown', showChatInterface);

      chatButton.on('pointerover', () => {
        chatButton.setStyle({
          backgroundColor: '#357abd',
        });
      });
      
      chatButton.on('pointerout', () => {
        chatButton.setStyle({
          backgroundColor: '#4a90e2',
        });
      });
    }

    function update() {
      if (!player) return;
      
      player.setVelocity(0);

      if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.setTexture('avatar-left');
      } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.setTexture('avatar-right');
      }

      if (cursors.up.isDown) {
        player.setVelocityY(-speed);
        player.setTexture('avatar-back');
      } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
        player.setTexture('avatar-front');
      }

      // Check proximity to sign
      checkSignProximity();

      // Check for NPC proximity
      const closestNPC = getNearestNPC();
      if (closestNPC && Phaser.Math.Distance.Between(player.x, player.y, closestNPC.x, closestNPC.y) < 150) {
        chatButton.setPosition(game.scale.width / 2, game.scale.height - 120);
        chatButton.setVisible(true);
        currentNPC = closestNPC;
      } else {
        chatButton.setVisible(false);
        currentNPC = null;
      }

      // Check for building proximity
      const closestBuilding = getNearestBuilding();
      if (closestBuilding && Phaser.Math.Distance.Between(player.x, player.y, closestBuilding.x, closestBuilding.y) < 150) {
        enterButton.setPosition(game.scale.width / 2, game.scale.height - 50);
        enterButton.setVisible(true);
      } else {
        enterButton.setVisible(false);
      }
    }

    function getNearestBuilding() {
      return buildings.getChildren().reduce((closest, building) => {
        const distance = Phaser.Math.Distance.Between(player.x, player.y, building.x, building.y);
        return !closest || distance < closest.distance ? { distance, building } : closest;
      }, null)?.building;
    }

    function getNearestNPC() {
      return npcs.getChildren().reduce((closest, npc) => {
        const distance = Phaser.Math.Distance.Between(player.x, player.y, npc.x, npc.y);
        return !closest || distance < closest.distance ? { distance, npc } : closest;
      }, null)?.npc;
    }

    function showShopPopup() {
      const closestBuilding = getNearestBuilding();
      if (closestBuilding) {
        const buildingInfo = closestBuilding.getData('buildingInfo');
        setCurrentShop(buildingInfo);
        setShowShop(true);
        
        // Pause game input when shop is open
        if (game.input && game.input.keyboard) {
          game.input.keyboard.enabled = false;
          game.input.keyboard.preventDefault = true;
        }
      }
    }

    function showChatInterface() {
      if (currentNPC) {
        const npcInfo = currentNPC.getData('npcInfo');
        setChatData(npcInfo);
        setShowChat(true);
      }
    }

    return () => {
      game.destroy(true);
    };
  }, [location, speed]);

  const increaseSpeed = () => setSpeed((prevSpeed) => prevSpeed + 100);
  const decreaseSpeed = () => setSpeed((prevSpeed) => Math.max(prevSpeed - 100, 0));
  const resetSpeed = () => setSpeed(200);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <WalletConnect />
      {/* <PaymanDebug /> */}
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
      
      {showWelcomePopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 0 20px rgba(45, 119, 148, 0.3)',
          maxWidth: '500px',
          width: '90%',
          zIndex: 1000,
          animation: 'fadeInTransform 0.5s ease-out',
          border: '2px solid #2d7794'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            right: '-20px',
            height: '10px',
            background: 'linear-gradient(90deg, #2d7794, white, #2d7794)',
            borderRadius: '10px'
          }}></div>
          
          <h2 style={{
            color: '#2d7794',
            textAlign: 'center',
            fontSize: '24px',
            marginBottom: '20px',
            fontFamily: 'Arial, sans-serif',
            textShadow: '2px 2px 4px rgba(45, 119, 148, 0.2)'
          }}>✨ Welcome to Payman Land! ✨</h2>
          
          <div style={{
            color: '#333',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            <p style={{ marginBottom: '15px' }}>
              🏰 Step into a magical world of fashion and technology where dreams become reality!
            </p>
            <p style={{ marginBottom: '15px' }}>
              Here you can:
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 20px 0'
            }}>
              <li style={{ margin: '10px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#2d7794', marginRight: '10px' }}>👕</span> Try on clothes virtually with AR magic
              </li>
              <li style={{ margin: '10px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#2d7794', marginRight: '10px' }}>💫</span> Get personalized fashion advice from our experts
              </li>
              <li style={{ margin: '10px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#2d7794', marginRight: '10px' }}>🔒</span> Shop securely with PayMan's blockchain technology
              </li>
              <li style={{ margin: '10px 0', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#2d7794', marginRight: '10px' }}>✨</span> Explore unique stores with authentic products
              </li>
            </ul>
          </div>
          
          <button 
            onClick={() => setShowWelcomePopup(false)}
            style={{
              backgroundColor: '#2d7794',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              display: 'block',
              margin: '0 auto',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 8px rgba(45, 119, 148, 0.2)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Begin Your Adventure! ✨
          </button>
        </div>
      )}
      
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Speed Controls:</div>
          <button onClick={increaseSpeed} style={buttonStyle}>+100</button>
          <button onClick={decreaseSpeed} style={buttonStyle}>-100</button>
          <button onClick={resetSpeed} style={buttonStyle}>Reset</button>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={() => navigate('/dashboard')} style={buttonStyle}>DASHBOARD</button>
          <button onClick={() => navigate('/create-avatar')} style={buttonStyle}>Change Avatar</button>
        </div>
      </div>
      
      {showShop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <GameShop 
            shopData={currentShop} 
            playerAvatarImage={location.state?.avatarImage || '/assets/ashfront.png'}
            onPaymentSuccess={(product, paymentId) => {
              console.log('Payment successful for:', product.name, 'Payment ID:', paymentId);
              // You can add additional logic here for successful payments
              // e.g., add items to inventory, show notifications, etc.
            }}
          />
          <button
            onClick={() => {
              setShowShop(false);
              
              // Re-enable game input when shop is closed
              if (gameInstance.current && gameInstance.current.input && gameInstance.current.input.keyboard) {
                gameInstance.current.input.keyboard.enabled = true;
                gameInstance.current.input.keyboard.preventDefault = false;
              }
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#ffffff',
              color: '#333333',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      {showChat && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <ChatInterface 
            npcName={chatData.name}
            onClose={() => setShowChat(false)}
            autoFocus={true}
          />
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  background: '#4CAF50',
  color: 'white',
  padding: '10px 15px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background 0.3s',
};

export default Playground;
