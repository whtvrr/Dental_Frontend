import React from 'react';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../../theme';

const AnatomicalToothSVG = ({ 
  number, 
  conditions = {}, 
  onSurfaceClick, 
  isSelected,
  statusesMap = {}
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const getConditionColor = (surface) => {
    const condition = conditions[surface];
    if (!condition || condition === 'normal') {
      // All surfaces start completely blank/white except jaw which has natural gum color
      if (surface === 'jaw') return theme.palette.mode === 'dark' ? '#4a2c2a' : '#f8e6e0';
      return '#ffffff'; // Completely white for ALL other surfaces (crowns, roots, channels, circles)
    }
    
    // Try to get color from real statuses first
    const statusInfo = statusesMap[condition];
    if (statusInfo) {
      return statusInfo.color;
    }
    
    // Fallback to white if status not found
    return '#ffffff';
  };

  const getToothType = (num) => {
    const lastDigit = num % 10;
    if ([1, 2].includes(lastDigit)) return 'incisor';
    if (lastDigit === 3) return 'canine';
    if ([4, 5].includes(lastDigit)) return 'premolar';
    if ([6, 7, 8].includes(lastDigit)) return 'molar';
    return 'incisor';
  };

  const toothType = getToothType(number);
  const isUpper = number < 30;
  const strokeColor = theme.palette.mode === 'dark' ? '#666' : '#333';

  const baseProps = {
    stroke: strokeColor,
    strokeWidth: '0.8',
    style: { cursor: 'pointer' }
  };

  const svgStyles = {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    filter: isSelected ? `drop-shadow(0 0 8px ${colors.blueAccent[400]})` : 'none',
    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
    '&:hover': {
      filter: `drop-shadow(0 0 6px ${colors.blueAccent[400]})`,
      transform: 'scale(1.05)'
    }
  };

  // Get anatomically correct root and channel information
  const getToothAnatomy = (toothNumber) => {
    const lastDigit = toothNumber % 10;
    const isUpperTooth = toothNumber < 30;
    
    const anatomy = {
      rootCount: 1,
      channelCount: 1,
      roots: []
    };
    
    // Incisors and Canines (11-13, 21-23, 31-33, 41-43) → 1 root, 1 channel
    if ([1, 2, 3].includes(lastDigit)) {
      anatomy.rootCount = 1;
      anatomy.channelCount = 1;
      anatomy.roots = [{ channels: 1 }];
    }
    // Premolars (14-15, 24-25, 34-35, 44-45) → 1-2 roots, 1-2 channels
    else if ([4, 5].includes(lastDigit)) {
      if (lastDigit === 4 && isUpperTooth) {
        // Upper first premolars often have 2 roots
        anatomy.rootCount = 2;
        anatomy.channelCount = 2;
        anatomy.roots = [
          { channels: 1 }, // Buccal
          { channels: 1 }  // Palatal
        ];
      } else {
        // Other premolars typically have 1 root with 1-2 channels
        anatomy.rootCount = 1;
        anatomy.channelCount = lastDigit === 4 ? 2 : 1;
        anatomy.roots = [{ channels: anatomy.channelCount }];
      }
    }
    // Molars (16-18, 26-28, 36-38, 46-48) → 2-3 roots, 3-4 channels
    else if ([6, 7, 8].includes(lastDigit)) {
      if (isUpperTooth) {
        // Upper molars: 3 roots, 3-4 channels
        anatomy.rootCount = 3;
        anatomy.channelCount = 4;
        anatomy.roots = [
          { channels: 2 }, // Mesiobuccal (MB1, MB2)
          { channels: 1 }, // Distobuccal
          { channels: 1 }  // Palatal
        ];
      } else {
        // Lower molars: 2 roots, 3-4 channels
        anatomy.rootCount = 2;
        anatomy.channelCount = lastDigit === 7 ? 3 : 4;
        anatomy.roots = [
          { channels: 2 }, // Mesial (ML, MB)
          { channels: lastDigit === 7 ? 1 : 2 } // Distal
        ];
      }
    }
    
    return anatomy;
  };

  const renderToothWithJaw = () => {
    const anatomy = getToothAnatomy(number);
    
    // Much larger dimensions for easy clicking - enlarged jaw for realism
    const jawHeight = 100;
    const jawY = 70; // Higher position so crown sits on jaw
    const centerX = 130;
    
    // Crown paths based on tooth type - much larger
    let crownPath = '';
    let rootPaths = [];
    let jawWidth = 100; // Default jaw width
    
    switch (toothType) {
      case 'incisor':
        jawWidth = 90;
        crownPath = `M${centerX-35} 30 Q${centerX-35} 15 ${centerX} 15 Q${centerX+35} 15 ${centerX+35} 30 L${centerX+35} ${jawY} Q${centerX+35} ${jawY+5} ${centerX} ${jawY+5} Q${centerX-35} ${jawY+5} ${centerX-35} ${jawY} Z`;
        rootPaths = [{
          path: `M${centerX-15} ${jawY+5} L${centerX-15} ${jawY+jawHeight+40} Q${centerX} ${jawY+jawHeight+45} ${centerX+15} ${jawY+jawHeight+40} L${centerX+15} ${jawY+5}`,
          channels: anatomy.roots[0].channels,
          centerX: centerX
        }];
        break;
        
      case 'canine':
        jawWidth = 95;
        crownPath = `M${centerX-35} 35 Q${centerX-35} 25 ${centerX-18} 15 L${centerX} 5 L${centerX+18} 15 Q${centerX+35} 25 ${centerX+35} 35 L${centerX+35} ${jawY} Q${centerX+35} ${jawY+5} ${centerX} ${jawY+5} Q${centerX-35} ${jawY+5} ${centerX-35} ${jawY} Z`;
        rootPaths = [{
          path: `M${centerX-15} ${jawY+5} L${centerX-15} ${jawY+jawHeight+50} Q${centerX} ${jawY+jawHeight+55} ${centerX+15} ${jawY+jawHeight+50} L${centerX+15} ${jawY+5}`,
          channels: anatomy.roots[0].channels,
          centerX: centerX
        }];
        break;
        
      case 'premolar':
        jawWidth = 120;
        crownPath = `M${centerX-45} 40 Q${centerX-45} 25 ${centerX-25} 20 L${centerX-12} 15 L${centerX} 20 L${centerX+12} 15 L${centerX+25} 20 Q${centerX+45} 25 ${centerX+45} 40 L${centerX+45} ${jawY} Q${centerX+45} ${jawY+5} ${centerX} ${jawY+5} Q${centerX-45} ${jawY+5} ${centerX-45} ${jawY} Z`;
        if (anatomy.rootCount === 2) {
          rootPaths = [
            {
              path: `M${centerX-20} ${jawY+5} L${centerX-20} ${jawY+jawHeight+45} Q${centerX-16} ${jawY+jawHeight+50} ${centerX-12} ${jawY+jawHeight+45} L${centerX-12} ${jawY+5}`,
              channels: anatomy.roots[0].channels,
              centerX: centerX-16
            },
            {
              path: `M${centerX+12} ${jawY+5} L${centerX+12} ${jawY+jawHeight+45} Q${centerX+16} ${jawY+jawHeight+50} ${centerX+20} ${jawY+jawHeight+45} L${centerX+20} ${jawY+5}`,
              channels: anatomy.roots[1].channels,
              centerX: centerX+16
            }
          ];
        } else {
          rootPaths = [{
            path: `M${centerX-15} ${jawY+5} L${centerX-15} ${jawY+jawHeight+45} Q${centerX} ${jawY+jawHeight+50} ${centerX+15} ${jawY+jawHeight+45} L${centerX+15} ${jawY+5}`,
            channels: anatomy.roots[0].channels,
            centerX: centerX
          }];
        }
        break;
        
      case 'molar':
        jawWidth = 140;
        crownPath = `M${centerX-55} 45 Q${centerX-55} 30 ${centerX-35} 25 L${centerX-20} 18 L${centerX} 25 L${centerX+20} 18 L${centerX+35} 25 Q${centerX+55} 30 ${centerX+55} 45 L${centerX+55} ${jawY} Q${centerX+55} ${jawY+5} ${centerX} ${jawY+5} Q${centerX-55} ${jawY+5} ${centerX-55} ${jawY} Z`;
        if (isUpper) {
          rootPaths = [
            {
              path: `M${centerX-28} ${jawY+5} L${centerX-28} ${jawY+jawHeight+50} Q${centerX-24} ${jawY+jawHeight+55} ${centerX-20} ${jawY+jawHeight+50} L${centerX-20} ${jawY+5}`,
              channels: anatomy.roots[0].channels,
              centerX: centerX-24
            },
            {
              path: `M${centerX+20} ${jawY+5} L${centerX+20} ${jawY+jawHeight+50} Q${centerX+24} ${jawY+jawHeight+55} ${centerX+28} ${jawY+jawHeight+50} L${centerX+28} ${jawY+5}`,
              channels: anatomy.roots[1].channels,
              centerX: centerX+24
            },
            {
              path: `M${centerX-6} ${jawY+5} L${centerX-6} ${jawY+jawHeight+40} Q${centerX} ${jawY+jawHeight+45} ${centerX+6} ${jawY+jawHeight+40} L${centerX+6} ${jawY+5}`,
              channels: anatomy.roots[2].channels,
              centerX: centerX
            }
          ];
        } else {
          rootPaths = [
            {
              path: `M${centerX-20} ${jawY+5} L${centerX-20} ${jawY+jawHeight+50} Q${centerX-16} ${jawY+jawHeight+55} ${centerX-12} ${jawY+jawHeight+50} L${centerX-12} ${jawY+5}`,
              channels: anatomy.roots[0].channels,
              centerX: centerX-16
            },
            {
              path: `M${centerX+12} ${jawY+5} L${centerX+12} ${jawY+jawHeight+50} Q${centerX+16} ${jawY+jawHeight+55} ${centerX+20} ${jawY+jawHeight+50} L${centerX+20} ${jawY+5}`,
              channels: anatomy.roots[1].channels,
              centerX: centerX+16
            }
          ];
        }
        break;
        
      default:
        jawWidth = 90;
        crownPath = `M${centerX-35} 30 Q${centerX-35} 15 ${centerX} 15 Q${centerX+35} 15 ${centerX+35} 30 L${centerX+35} ${jawY} Q${centerX+35} ${jawY+5} ${centerX} ${jawY+5} Q${centerX-35} ${jawY+5} ${centerX-35} ${jawY} Z`;
        rootPaths = [{
          path: `M${centerX-15} ${jawY+5} L${centerX-15} ${jawY+jawHeight+40} Q${centerX} ${jawY+jawHeight+45} ${centerX+15} ${jawY+jawHeight+40} L${centerX+15} ${jawY+5}`,
          channels: 1,
          centerX: centerX
        }];
    }
    
    return (
      <g>
        {/* Large realistic jaw background - matches tooth width */}
        <rect
          x={centerX - jawWidth/2}
          y={jawY}
          width={jawWidth}
          height={jawHeight}
          fill={getConditionColor('jaw') || (theme.palette.mode === 'dark' ? '#4a2c2a' : '#f8e6e0')}
          stroke={strokeColor}
          strokeWidth="3"
          rx="12"
          {...baseProps}
          onClick={() => onSurfaceClick(number, 'jaw')}
        />
        
        {/* Additional jaw detail for realism */}
        <rect
          x={centerX - jawWidth/2 + 3}
          y={jawY + 3}
          width={jawWidth - 6}
          height={jawHeight - 6}
          fill="none"
          stroke={theme.palette.mode === 'dark' ? '#666' : '#ddd'}
          strokeWidth="1.5"
          rx="10"
          opacity="0.6"
        />
        
        {/* Large crown */}
        <path
          d={crownPath}
          fill={getConditionColor('crown') || '#ffffff'}
          stroke={strokeColor}
          strokeWidth="2.5"
          {...baseProps}
          onClick={() => onSurfaceClick(number, 'crown')}
        />
        
        {/* First render all roots clearly, then channels on top */}
        {rootPaths.map((root, rootIndex) => (
          <g key={`root-${rootIndex}`}>
            {/* Enhanced root shape - clearly visible, normal state */}
            <path
              d={root.path}
              fill={getConditionColor(`root_${rootIndex + 1}`)}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              {...baseProps}
              onClick={() => onSurfaceClick(number, `root_${rootIndex + 1}`)}
            />
            
            {/* Root outline for better definition */}
            <path
              d={root.path}
              fill="none"
              stroke={theme.palette.mode === 'dark' ? '#aaa' : '#333'}
              strokeWidth="1"
              opacity="0.8"
            />
          </g>
        ))}
        
        {/* Now render channels on top of roots - clearly visible and clickable */}
        {rootPaths.map((root, rootIndex) => 
          Array.from({ length: root.channels }, (_, channelIndex) => {
            const channelOffset = root.channels === 1 ? 0 : (channelIndex - (root.channels - 1) / 2) * 12;
            const startY = jawY + 10;
            const endY = jawY + jawHeight + (toothType === 'canine' ? 50 : (toothType === 'molar' ? 50 : 45));
            const channelId = `channel_${rootIndex + 1}_${channelIndex + 1}`;
            
            return (
              <g key={`channel-${rootIndex}-${channelIndex}`}>
                {/* Large clickable area for easy clicking */}
                <rect
                  x={root.centerX + channelOffset - 12}
                  y={startY}
                  width="24"
                  height={endY - startY}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSurfaceClick(number, channelId)}
                />
                
                {/* Channel background for visibility */}
                <line
                  x1={root.centerX + channelOffset}
                  y1={startY + 5}
                  x2={root.centerX + channelOffset}
                  y2={endY - 5}
                  stroke={theme.palette.mode === 'dark' ? '#333' : '#f0f0f0'}
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                
                {/* Main channel line - clearly visible and colorable */}
                <line
                  x1={root.centerX + channelOffset}
                  y1={startY + 5}
                  x2={root.centerX + channelOffset}
                  y2={endY - 5}
                  stroke={getConditionColor(channelId)}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                
                {/* Channel border for definition */}
                <line
                  x1={root.centerX + channelOffset}
                  y1={startY + 5}
                  x2={root.centerX + channelOffset}
                  y2={endY - 5}
                  stroke={theme.palette.mode === 'dark' ? '#555' : '#ccc'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </g>
            );
          })
        )}
        
        {/* Large tooth number */}
        <text
          x={centerX}
          y={20}
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill={theme.palette.mode === 'dark' ? '#ffffff' : '#000000'}
          stroke={theme.palette.mode === 'dark' ? '#000000' : '#ffffff'}
          strokeWidth="0.8"
          pointerEvents="none"
        >
          {number}
        </text>
      </g>
    );
  };


  // Render large 5-segment circle diagram
  const renderCircleDiagram = () => {
    const centerY = 310;
    const radius = 45;
    const centerRadius = 20; // Larger center circle for better visibility
    const centerX = 130;
    
    return (
      <g transform={`translate(${centerX}, ${centerY})`}>
        {/* Large outer circle */}
        <circle
          cx="0" cy="0"
          r={radius}
          fill="#ffffff"
          stroke={strokeColor}
          strokeWidth="4"
        />
        
        {/* 4 large outer segments */}
        <path
          d={`M 0,0 L 0,-${radius} A ${radius},${radius} 0 0,1 ${radius},0 L 0,0 Z`}
          fill={getConditionColor('occlusal')}
          stroke={strokeColor}
          strokeWidth="3"
          {...baseProps}
          onClick={() => onSurfaceClick(number, 'occlusal')}
        />
        <path
          d={`M 0,0 L ${radius},0 A ${radius},${radius} 0 0,1 0,${radius} L 0,0 Z`}
          fill={getConditionColor('distal')}
          stroke={strokeColor}
          strokeWidth="3"
          {...baseProps}
          onClick={() => onSurfaceClick(number, 'distal')}
        />
        <path
          d={`M 0,0 L 0,${radius} A ${radius},${radius} 0 0,1 -${radius},0 L 0,0 Z`}
          fill={getConditionColor('cervical')}
          stroke={strokeColor}
          strokeWidth="3"
          {...baseProps}
          onClick={() => onSurfaceClick(number, 'cervical')}
        />
        <path
          d={`M 0,0 L -${radius},0 A ${radius},${radius} 0 0,1 0,-${radius} L 0,0 Z`}
          fill={getConditionColor('mesial')}
          stroke={strokeColor}
          strokeWidth="3"
          {...baseProps}
          onClick={() => onSurfaceClick(number, 'mesial')}
        />
        
        {/* Large center circle - more visible with enhanced styling */}
        <circle
          cx="0" cy="0"
          r={centerRadius}
          fill={getConditionColor('pulp')}
          stroke={strokeColor}
          strokeWidth="4"
          {...baseProps}
          onClick={() => onSurfaceClick(number, 'pulp')}
        />
        
        {/* Center circle highlight for better visibility */}
        <circle
          cx="0" cy="0"
          r={centerRadius - 2}
          fill="none"
          stroke={theme.palette.mode === 'dark' ? '#666' : '#ddd'}
          strokeWidth="1"
          opacity="0.6"
        />
        
        {/* Thick division lines */}
        <line x1={-radius} y1="0" x2={radius} y2="0" stroke={strokeColor} strokeWidth="4" />
        <line x1="0" y1={-radius} x2="0" y2={radius} stroke={strokeColor} strokeWidth="4" />
      </g>
    );
  };

  return (
    <Box
      component="svg"
      width="220"
      height="380"
      viewBox="0 0 260 360"
      sx={svgStyles}
    >
      {renderToothWithJaw()}
      {renderCircleDiagram()}
    </Box>
  );
};

export default AnatomicalToothSVG;

