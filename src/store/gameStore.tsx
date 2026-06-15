import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, Player } from '@/types/room';
import { Challenge } from '@/types/game';
import { Message } from '@/types/message';

interface GameContextType {
  currentRoom: Room | null;
  currentPlayer: Player | null;
  challenges: Challenge[];
  messages: Message[];
  setCurrentRoom: (room: Room | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  addChallenge: (challenge: Challenge) => void;
  addMessage: (message: Message) => void;
  updateChallenge: (challengeId: string, data: Partial<Challenge>) => void;
  clearGameData: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const addChallenge = (challenge: Challenge) => {
    setChallenges(prev => [...prev, challenge]);
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateChallenge = (challengeId: string, data: Partial<Challenge>) => {
    setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId ? { ...challenge, ...data } : challenge
      )
    );
  };

  const clearGameData = () => {
    setCurrentRoom(null);
    setCurrentPlayer(null);
    setChallenges([]);
    setMessages([]);
  };

  return (
    <GameContext.Provider
      value={{
        currentRoom,
        currentPlayer,
        challenges,
        messages,
        setCurrentRoom,
        setCurrentPlayer,
        addChallenge,
        addMessage,
        updateChallenge,
        clearGameData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};