import React from 'react';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import { DENTAL_CONDITIONS } from '../../data/dentalConditions';

const AnatomicalToothSVG = ({ 
  number, 
  conditions = {}, 
  onSurfaceClick, 
  isSelected 
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const getConditionColor = (surface) => {
    const condition = conditions[surface];
    if (!condition) return theme.palette.mode === 'dark' ? '#ffffff' : '#f8f9fa';
    return DENTAL_CONDITIONS[condition]?.color || (theme.palette.mode === 'dark' ? '#ffffff' : '#f8f9fa');
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

  const renderProfessionalTooth = () => {
    switch (toothType) {
      case 'incisor':
        if ([1, 2].includes(number % 10)) {
          // Central and Lateral Incisors
          return (
            <g>
              {/* Crown - anatomical incisor shape */}
              <path
                d="M25 5 C28 5, 32 7, 32 12 L32 25 C32 28, 30 30, 25 30 C20 30, 18 28, 18 25 L18 12 C18 7, 22 5, 25 5 Z"
                fill={getConditionColor('crown')}
                {...baseProps}
                onClick={() => onSurfaceClick(number, 'crown')}
              />
              
              {/* Incisal edge */}
              <path
                d="M22 7 L28 7 L30 5 L20 5 Z"
                fill={getConditionColor('incisal')}
                {...baseProps}
                onClick={() => onSurfaceClick(number, 'incisal')}
              />
              
              {/* Mesial surface */}
              <path
                d="M18 12 L15 15 L15 28 L18 25 Z"
                fill={getConditionColor('mesial')}
                {...baseProps}
                onClick={() => onSurfaceClick(number, 'mesial')}
              />
              
              {/* Distal surface */}
              <path
                d="M32 12 L35 15 L35 28 L32 25 Z"
                fill={getConditionColor('distal')}
                {...baseProps}
                onClick={() => onSurfaceClick(number, 'distal')}
              />
              
              {/* Lingual surface */}
              <path
                d="M20 10 L30 10 L28 22 L22 22 Z"
                fill={getConditionColor('lingual')}
                fillOpacity="0.7"
                {...baseProps}
                onClick={() => onSurfaceClick(number, 'lingual')}
              />
              
              {/* Root - single, tapered */}
              <path
                d="M22 30 C22 30, 23 42, 25 48 C27 42, 28 30, 28 30 Z"
                fill={getConditionColor('root')}
                {...baseProps}
                onClick={() => onSurfaceClick(number, 'root')}
              />
              
              {/* Root apex */}
              <ellipse
                cx="25" cy="48"
                rx="1.5" ry="1"
                fill={getConditionColor('root')}
                {...baseProps}
                onClick={() => onSurfaceClick(number, 'root')}
              />
            </g>
          );
        }
        break;

      case 'canine':
        return (
          <g>
            {/* Crown - pointed canine shape */}
            <path
              d="M25 3 C28 3, 33 6, 33 14 L33 27 C33 30, 31 32, 25 32 C19 32, 17 30, 17 27 L17 14 C17 6, 22 3, 25 3 Z"
              fill={getConditionColor('crown')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'crown')}
            />
            
            {/* Cusp - sharp pointed tip */}
            <path
              d="M17 14 L25 3 L33 14 L28 10 L25 5 L22 10 Z"
              fill={getConditionColor('cusp')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'cusp')}
            />
            
            {/* Mesial surface */}
            <path
              d="M17 14 L14 17 L14 30 L17 27 Z"
              fill={getConditionColor('mesial')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'mesial')}
            />
            
            {/* Distal surface */}
            <path
              d="M33 14 L36 17 L36 30 L33 27 Z"
              fill={getConditionColor('distal')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'distal')}
            />
            
            {/* Lingual surface */}
            <path
              d="M19 12 L31 12 L29 25 L21 25 Z"
              fill={getConditionColor('lingual')}
              fillOpacity="0.7"
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'lingual')}
            />
            
            {/* Root - long single root */}
            <path
              d="M22 32 C22 32, 23 48, 25 54 C27 48, 28 32, 28 32 Z"
              fill={getConditionColor('root')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'root')}
            />
            
            {/* Root apex */}
            <ellipse
              cx="25" cy="54"
              rx="1.5" ry="1"
              fill={getConditionColor('root')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'root')}
            />
          </g>
        );

      case 'premolar':
        return (
          <g>
            {/* Crown - premolar shape with cusps */}
            <path
              d="M25 8 C30 8, 36 10, 36 16 L36 28 C36 31, 34 33, 25 33 C16 33, 14 31, 14 28 L14 16 C14 10, 20 8, 25 8 Z"
              fill={getConditionColor('crown')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'crown')}
            />
            
            {/* Occlusal surface */}
            <ellipse
              cx="25" cy="16"
              rx="8" ry="4"
              fill={getConditionColor('occlusal')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'occlusal')}
            />
            
            {/* Buccal cusp */}
            <path
              d="M18 14 L22 8 L26 14 L22 16 Z"
              fill={getConditionColor('buccal_cusp')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'buccal_cusp')}
            />
            
            {/* Lingual cusp */}
            <path
              d="M24 14 L28 8 L32 14 L28 16 Z"
              fill={getConditionColor('lingual_cusp')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'lingual_cusp')}
            />
            
            {/* Mesial surface */}
            <path
              d="M14 16 L11 19 L11 31 L14 28 Z"
              fill={getConditionColor('mesial')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'mesial')}
            />
            
            {/* Distal surface */}
            <path
              d="M36 16 L39 19 L39 31 L36 28 Z"
              fill={getConditionColor('distal')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'distal')}
            />
            
            {/* Root - single or bifurcated */}
            <path
              d="M22 33 C22 33, 23 45, 25 50 C27 45, 28 33, 28 33 Z"
              fill={getConditionColor('root')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'root')}
            />
            
            {/* Root apex */}
            <ellipse
              cx="25" cy="50"
              rx="1.5" ry="1"
              fill={getConditionColor('root')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'root')}
            />
          </g>
        );

      case 'molar':
        return (
          <g>
            {/* Crown - large molar with multiple cusps */}
            <path
              d="M25 10 C32 10, 40 12, 40 18 L40 30 C40 33, 38 35, 25 35 C12 35, 10 33, 10 30 L10 18 C10 12, 18 10, 25 10 Z"
              fill={getConditionColor('crown')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'crown')}
            />
            
            {/* Occlusal surface with grooves */}
            <ellipse
              cx="25" cy="18"
              rx="12" ry="5"
              fill={getConditionColor('occlusal')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'occlusal')}
            />
            
            {/* Mesiobuccal cusp */}
            <path
              d="M15 16 L20 10 L25 16 L20 18 Z"
              fill={getConditionColor('cusp_mb')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'cusp_mb')}
            />
            
            {/* Distobuccal cusp */}
            <path
              d="M25 16 L30 10 L35 16 L30 18 Z"
              fill={getConditionColor('cusp_db')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'cusp_db')}
            />
            
            {/* Mesiolingual cusp */}
            <path
              d="M15 20 L20 14 L25 20 L20 22 Z"
              fill={getConditionColor('cusp_ml')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'cusp_ml')}
            />
            
            {/* Distolingual cusp */}
            <path
              d="M25 20 L30 14 L35 20 L30 22 Z"
              fill={getConditionColor('cusp_dl')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'cusp_dl')}
            />
            
            {/* Central groove pattern */}
            <line x1="17" y1="18" x2="33" y2="18" stroke={strokeColor} strokeWidth="0.5" />
            <line x1="25" y1="14" x2="25" y2="22" stroke={strokeColor} strokeWidth="0.5" />
            
            {/* Mesial surface */}
            <path
              d="M10 18 L7 21 L7 33 L10 30 Z"
              fill={getConditionColor('mesial')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'mesial')}
            />
            
            {/* Distal surface */}
            <path
              d="M40 18 L43 21 L43 33 L40 30 Z"
              fill={getConditionColor('distal')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'distal')}
            />
            
            {/* Mesial root */}
            <path
              d="M20 35 C20 35, 21 47, 22 52 C23 47, 24 35, 24 35 Z"
              fill={getConditionColor('root_mesial')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'root_mesial')}
            />
            
            {/* Distal root */}
            <path
              d="M26 35 C26 35, 27 47, 28 52 C29 47, 30 35, 30 35 Z"
              fill={getConditionColor('root_distal')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'root_distal')}
            />
            
            {/* Root apices */}
            <ellipse
              cx="22" cy="52"
              rx="1" ry="0.8"
              fill={getConditionColor('root_mesial')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'root_mesial')}
            />
            <ellipse
              cx="28" cy="52"
              rx="1" ry="0.8"
              fill={getConditionColor('root_distal')}
              {...baseProps}
              onClick={() => onSurfaceClick(number, 'root_distal')}
            />
            
            {/* Third root for upper molars */}
            {isUpper && [6, 7].includes(number % 10) && (
              <>
                <path
                  d="M25 35 C25 35, 25 44, 25 48 C25 44, 25 35, 25 35 Z"
                  fill={getConditionColor('root_palatal')}
                  {...baseProps}
                  onClick={() => onSurfaceClick(number, 'root_palatal')}
                />
                <ellipse
                  cx="25" cy="48"
                  rx="1" ry="0.8"
                  fill={getConditionColor('root_palatal')}
                  {...baseProps}
                  onClick={() => onSurfaceClick(number, 'root_palatal')}
                />
              </>
            )}
          </g>
        );

      default:
        return null;
    }
  };

  // Render circular diagram like in professional charts
  const renderCircularDiagram = () => (
    <g transform="translate(25, 65)">
      <circle
        cx="0" cy="0"
        r="10"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1"
      />
      
      {/* Quadrant divisions */}
      <line x1="-10" y1="0" x2="10" y2="0" stroke={strokeColor} strokeWidth="0.8" />
      <line x1="0" y1="-10" x2="0" y2="10" stroke={strokeColor} strokeWidth="0.8" />
      
      {/* Additional divisions for molars */}
      {toothType === 'molar' && (
        <>
          <line x1="-7" y1="-7" x2="7" y2="7" stroke={strokeColor} strokeWidth="0.5" />
          <line x1="-7" y1="7" x2="7" y2="-7" stroke={strokeColor} strokeWidth="0.5" />
        </>
      )}
      
      {/* Color segments based on conditions */}
      {conditions.crown && (
        <path
          d="M 0,-10 A 10,10 0 0,1 10,0 L 0,0 Z"
          fill={getConditionColor('crown')}
          onClick={() => onSurfaceClick(number, 'crown')}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {conditions.distal && (
        <path
          d="M 10,0 A 10,10 0 0,1 0,10 L 0,0 Z"
          fill={getConditionColor('distal')}
          onClick={() => onSurfaceClick(number, 'distal')}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {conditions.root && (
        <path
          d="M 0,10 A 10,10 0 0,1 -10,0 L 0,0 Z"
          fill={getConditionColor('root')}
          onClick={() => onSurfaceClick(number, 'root')}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {conditions.mesial && (
        <path
          d="M -10,0 A 10,10 0 0,1 0,-10 L 0,0 Z"
          fill={getConditionColor('mesial')}
          onClick={() => onSurfaceClick(number, 'mesial')}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {/* Center dot for complex conditions */}
      {(conditions.occlusal || conditions.pulp) && (
        <circle
          cx="0" cy="0"
          r="2"
          fill={getConditionColor(conditions.occlusal ? 'occlusal' : 'pulp')}
          onClick={() => onSurfaceClick(number, conditions.occlusal ? 'occlusal' : 'pulp')}
          style={{ cursor: 'pointer' }}
        />
      )}
    </g>
  );

  return (
    <Box
      component="svg"
      width="60"
      height="90"
      viewBox="0 0 50 85"
      sx={svgStyles}
    >
      {renderProfessionalTooth()}
      {renderCircularDiagram()}
    </Box>
  );
};

export default AnatomicalToothSVG;