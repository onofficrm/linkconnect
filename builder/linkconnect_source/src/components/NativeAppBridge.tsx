import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initNativePush } from '../lib/nativeApp';

export function NativeAppBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    void initNativePush((path) => navigate(path));
  }, [navigate]);
  return null;
}
