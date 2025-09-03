import { useState, useEffect, useCallback } from 'react';

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

  const updateToothCondition = useCallback(async (toothNumber, surface, condition) => {
    const updatedConditions = {
      ...toothConditions,
      [toothNumber]: {
        ...toothConditions[toothNumber],
        [surface]: condition
      }
    };

    // Optimistic update
    setToothConditions(updatedConditions);

    try {
      // Replace with actual API endpoint
      // await fetch(`/api/patients/${patientId}/dental-chart/surfaces`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ toothNumber, surface, condition })
      // });
      
      console.log('Saved dental chart:', { patientId, toothNumber, surface, condition });
      
      // Show success notification
      showNotification('Изменения сохранены', 'success');
      
    } catch (err) {
      // Revert on error
      setToothConditions(toothConditions);
      setError(err.message);
      showNotification('Ошибка сохранения', 'error');
    }
  }, [patientId, toothConditions]);

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
    refreshChart: () => loadDentalChart(patientId)
  };
};