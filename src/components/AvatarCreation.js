// AvatarCreation.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AvatarCreation.css';
import '../animations.css';

function AvatarCreation() {
  const navigate = useNavigate();
  const [selectedPokemon] = useState('ash');

  // List of available Pokemon sprites
  const availablePokemon = [
    'pikachu',
    'charizard',
    'bulbasaur',
    'squirtle',
    'mewtwo',
    'eevee',
    'snorlax',
    'gengar',
    'dragonite',
    'gyarados'
  ];

  useEffect(() => {
    // Pokemon list is static, no need to set state
    console.log('Available Pokemon:', availablePokemon);
  }, [availablePokemon]);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Save selected Pokemon to localStorage
      localStorage.setItem('avatarData', JSON.stringify({
        userId: 'user123',
        pokemon: selectedPokemon,
        avatarImage: '/assets/ashfront.png'
      }));
      
      // Pass the avatar data to the Playground component
      navigate('/playground', { 
        state: { 
          selectedPokemon,
          avatarImage: '/assets/ashfront.png'
        } 
      });
    } catch (error) {
      console.error('Failed to save avatar:', error);
      alert('Failed to save avatar. Please try again.');
    }
  };

  return (
    <div className="avatar-creation">
      <div className="avatar-creation-content">
        <h2>Choose Your Avatar</h2>
        <div className="avatar-preview">
          <img 
            src="/assets/ashfront.png" 
            alt="Avatar Preview" 
            style={{ 
              maxWidth: '200px',
              height: 'auto',
              imageRendering: 'pixelated'
            }} 
          />
        </div>
        <button onClick={handleSubmit} className="submit-button">
          Start Adventure!
        </button>
      </div>
    </div>
  );
}

export default AvatarCreation;