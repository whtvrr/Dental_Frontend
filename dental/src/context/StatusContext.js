import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

const StatusContext = createContext();

export const useStatusContext = () => {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatusContext must be used within a StatusProvider');
  }
  return context;
};

export const StatusProvider = ({ children }) => {
  const api = useApi();
  const [statuses, setStatuses] = useState([]);
  const [statusesMap, setStatusesMap] = useState({});
  const [statusesLookup, setStatusesLookup] = useState({});
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

          // Create a map for easy lookup by ID
          const map = {};
          const lookupMap = {}; // Separate map for lookups by ID/code

          statusList.forEach(status => {
            const statusData = {
              id: status.id,
              label: status.title,
              color: status.color,
              type: status.type,
              code: status.code,
              description: status.description
            };

            // Use ID as the primary key for display (avoid duplicates)
            map[status.id] = statusData;

            // Create lookup entries for both code and ID
            lookupMap[status.id] = statusData;
            if (status.code && status.code !== status.id) {
              lookupMap[status.code] = statusData;
            }
          });

          // Store both maps
          setStatusesMap(map); // For display (no duplicates)
          setStatusesLookup(lookupMap); // For lookups (with aliases)

          // Add default "normal" status for healthy teeth
          const normalStatus = {
            id: 'normal',
            label: 'Норма',
            color: '#ffffff',
            type: 'normal',
            code: 'normal',
            description: 'Здоровый зуб'
          };

          map['normal'] = normalStatus;
          lookupMap['normal'] = normalStatus;

          setStatusesMap(map);
          setStatusesLookup(lookupMap);
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
      const normalStatus = {
        id: 'normal',
        label: 'Норма',
        color: '#ffffff',
        type: 'normal',
        code: 'normal',
        description: 'Здоровый зуб'
      };

      setStatusesMap({ normal: normalStatus });
      setStatusesLookup({ normal: normalStatus });
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

  const value = {
    statuses,
    statusesMap,      // For display (no duplicates)
    statusesLookup,   // For lookups by ID/code (with aliases)
    loading,
    error,
    refreshStatuses
  };

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  );
};