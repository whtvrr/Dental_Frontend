import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useStatuses = () => {
  const api = useApi();
  const [statuses, setStatuses] = useState([]);
  const [statusesMap, setStatusesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatuses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/statuses?offset=0&limit=1000');
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data?.statuses) {
          const statusList = data.data.statuses.filter(status => status.is_active);
          setStatuses(statusList);
          
          // Create a map for easy lookup by ID or code
          const map = {};
          statusList.forEach(status => {
            const key = status.code || status.id;
            map[key] = {
              id: status.id,
              label: status.title,
              color: status.color,
              type: status.type,
              code: status.code,
              description: status.description
            };
          });
          
          // Add default "normal" status for healthy teeth
          map['normal'] = {
            id: 'normal',
            label: 'Норма',
            color: '#ffffff',
            type: 'normal',
            code: 'normal',
            description: 'Здоровый зуб'
          };
          
          setStatusesMap(map);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch statuses:', err);
      
      // Fallback to basic normal status
      setStatusesMap({
        normal: {
          id: 'normal',
          label: 'Норма',
          color: '#ffffff',
          type: 'normal',
          code: 'normal',
          description: 'Здоровый зуб'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const refreshStatuses = () => {
    fetchStatuses();
  };

  return {
    statuses,
    statusesMap,
    loading,
    error,
    refreshStatuses
  };
};