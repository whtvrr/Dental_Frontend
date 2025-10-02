import { useState, useEffect, useCallback } from 'react';

// Convert backend Formula format to frontend toothConditions format
const convertFormulaToConditions = (formulaData) => {
  const conditions = {};

  if (!formulaData || !formulaData.teeth) {
    return conditions;
  }

  formulaData.teeth.forEach(tooth => {
    const toothNumber = tooth.number;
    conditions[toothNumber] = {};

    // Gum (jaw in frontend)
    if (tooth.gum && tooth.gum.status_id) {
      conditions[toothNumber].jaw = tooth.gum.status_id;
    }

    // Whole (crown in frontend)
    if (tooth.whole && tooth.whole.status_id) {
      conditions[toothNumber].crown = tooth.whole.status_id;
    }

    // Roots - stored as array in backend, numbered from left to right in frontend
    if (tooth.roots && Array.isArray(tooth.roots)) {
      tooth.roots.forEach((root, index) => {
        if (root && root.status_id) {
          conditions[toothNumber][`root_${index + 1}`] = root.status_id;
        }
      });
    }

    // Segments - convert from backend keys to frontend keys
    if (tooth.segments) {
      const segmentMapping = {
        'mid': 'pulp',      // mid -> center circle
        'rt': 'occlusal',   // rt -> top-right
        'rb': 'distal',     // rb -> bottom-right
        'lb': 'cervical',   // lb -> bottom-left
        'lt': 'mesial'      // lt -> top-left
      };

      Object.entries(segmentMapping).forEach(([backendKey, frontendKey]) => {
        if (tooth.segments[backendKey] && tooth.segments[backendKey].status_id) {
          conditions[toothNumber][frontendKey] = tooth.segments[backendKey].status_id;
        }
      });
    }
  });

  return conditions;
};

export const useDentalChart = (patientId) => {
  const [toothConditions, setToothConditions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load dental chart data
  useEffect(() => {
    if (patientId) {
      loadDentalChart(patientId);
    }
  }, [patientId]);

  const loadDentalChart = async (patientId) => {
    setLoading(true);
    setError(null);

    try {
      // Replace with actual API endpoint
      // const response = await fetch(`/api/patients/${patientId}/dental-chart`);
      // const data = await response.json();

      // Empty data - all teeth start in normal condition
      const sampleData = {};

      setToothConditions(sampleData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load dental chart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateToothCondition = useCallback(async (toothNumber, surface, conditionKey, statusesMap = {}) => {
    // Get the actual ObjectID from the statusesMap
    const statusId = statusesMap[conditionKey]?.id || conditionKey;

    const updatedConditions = {
      ...toothConditions,
      [toothNumber]: {
        ...toothConditions[toothNumber],
        [surface]: statusId
      }
    };

    // Optimistic update
    setToothConditions(updatedConditions);

    try {
      // Replace with actual API endpoint
      // await fetch(`/api/patients/${patientId}/dental-chart/surfaces`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ toothNumber, surface, condition: statusId })
      // });

      console.log('Saved dental chart:', { patientId, toothNumber, surface, condition: statusId });

      // Show success notification
      showNotification('Изменения сохранены', 'success');

    } catch (err) {
      // Revert on error
      setToothConditions(toothConditions);
      setError(err.message);
      showNotification('Ошибка сохранения', 'error');
    }
  }, [patientId, toothConditions]);

  // Convert toothConditions to backend Formula format
  const getFormulaData = useCallback(() => {
    const teeth = [];
    const allToothNumbers = [
      18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
      48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
    ];

    allToothNumbers.forEach(toothNumber => {
      const conditions = toothConditions[toothNumber] || {};
      const tooth = { number: toothNumber };

      // Gum is the jaw surface
      if (conditions.jaw) {
        tooth.gum = { status_id: conditions.jaw };
      }

      // Crown is the "whole" half-circular shape
      if (conditions.crown) {
        tooth.whole = { status_id: conditions.crown };
      }

      // Roots are collected from left to right (root_1, root_2, root_3)
      // Determine max number of roots based on tooth anatomy
      const getMaxRoots = (toothNum) => {
        const lastDigit = toothNum % 10;
        const isUpper = toothNum < 30;
        // Molars: upper have 3, lower have 2
        if ([6, 7, 8].includes(lastDigit)) {
          return isUpper ? 3 : 2;
        }
        // Upper first premolars sometimes have 2 roots
        if (lastDigit === 4 && isUpper) {
          return 2;
        }
        // All others have 1 root
        return 1;
      };

      const maxRoots = getMaxRoots(toothNumber);
      const rootStatuses = [];
      for (let i = 1; i <= maxRoots; i++) {
        const rootKey = `root_${i}`;
        if (conditions[rootKey]) {
          rootStatuses.push({ status_id: conditions[rootKey] });
        }
      }
      if (rootStatuses.length > 0) {
        tooth.roots = rootStatuses;
      }

      // Segments - map the circle segments to backend format
      const segments = {};
      const segmentMapping = {
        'pulp': 'mid',      // center circle -> mid
        'occlusal': 'rt',   // top-right -> rt
        'distal': 'rb',     // bottom-right -> rb
        'cervical': 'lb',   // bottom-left -> lb
        'mesial': 'lt'      // top-left -> lt
      };

      Object.entries(segmentMapping).forEach(([frontendKey, backendKey]) => {
        if (conditions[frontendKey]) {
          segments[backendKey] = { status_id: conditions[frontendKey] };
        }
      });

      if (Object.keys(segments).length > 0) {
        tooth.segments = segments;
      }

      // Only include teeth that have at least one condition set
      if (tooth.gum || tooth.whole || tooth.roots || tooth.segments) {
        teeth.push(tooth);
      }
    });

    return teeth.length > 0 ? { teeth } : null;
  }, [toothConditions]);

  const showNotification = (message, type) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideInRight 0.3s ease;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  return {
    toothConditions,
    loading,
    error,
    updateToothCondition,
    refreshChart: () => loadDentalChart(patientId),
    getFormulaData
  };
};