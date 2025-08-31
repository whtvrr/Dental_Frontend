import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import ApiClient from '../utils/apiClient';

// Custom hook to provide authenticated API client
export const useApi = () => {
  const authContext = useContext(AuthContext);
  
  const apiClient = useMemo(() => {
    return new ApiClient(authContext);
  }, [authContext]);

  return apiClient;
};

export default useApi;