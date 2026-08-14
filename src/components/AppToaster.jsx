import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '../hooks/useTheme';

const AppToaster = () => {
  const { theme } = useTheme();
  return <Toaster theme={theme} position="top-center" richColors />;
};

export default AppToaster;