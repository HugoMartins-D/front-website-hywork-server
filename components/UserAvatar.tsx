// src/components/UserAvatar.tsx
'use client';

import React, { useContext } from 'react';
import Image from 'next/image';
import { UserContext } from '@/contexts/UserContext';

interface User {
  id: string | number;
  username?: string;
  avatar?: string;
  status?: 'inactive' | 'busy' | 'ready';
}

interface UserAvatarProps {
  user?: User | null;
  size?: number;
  allowStatusChange?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user: userProp,
  size = 40,
  allowStatusChange = false,
  onClick = null,
  className = '',
}) => {
  const { user: currentUser, updateUserStatus } = useContext(UserContext);
  
  const isSelf = currentUser && userProp && currentUser.id === userProp.id;
  
  const displayStatus = isSelf 
    ? (currentUser?.status || 'inactive') 
    : (userProp?.status || 'inactive');
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'busy': return '#f44336';
      case 'ready': return '#4caf50';
      default: return '#9e9e9e';
    }
  };
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'busy': return "Ocupado";
      case 'ready': return "Disponível";
      default: return "Inativo";
    }
  };
  
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isSelf || !allowStatusChange) return;
    
    const statuses: ('inactive' | 'busy' | 'ready')[] = ['inactive', 'busy', 'ready'];
    const currentIndex = statuses.indexOf(displayStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    updateUserStatus(newStatus);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.stopPropagation();
      onClick(e);
    }
  };
  
  const borderColor = getStatusColor(displayStatus);
  const statusText = getStatusText(displayStatus);
  const title = isSelf 
    ? `Status: ${statusText} - Clique duas vezes para alterar`
    : `Status: ${statusText}`;
  
  const avatarSrc = userProp?.avatar || '/images/avatars/default.png';
  const hasClick = onClick || (isSelf && allowStatusChange);
  
  return (
    <div
      className={`relative rounded-full flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={title}
      role="img"
      aria-label={userProp?.username || "Usuário"}
    >
      <Image
        src={avatarSrc}
        alt={userProp?.username || "Usuário"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{
          border: `3px solid ${borderColor}`,
          cursor: hasClick ? 'pointer' : 'default',
        }}
      />
      
      {/* Status indicator dot */}
      {displayStatus && (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2 border-white"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: borderColor,
            minWidth: size * 0.3,
            minHeight: size * 0.3,
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;