import { useEffect, useState } from 'react';
import { getPerfConfig, subscribePerf, type PerfConfig } from './perfTier';

/** Devuelve la configuracion de rendimiento vigente y se actualiza si degrada. */
export const usePerfConfig = (): PerfConfig => {
  const [config, setConfig] = useState<PerfConfig>(getPerfConfig);

  useEffect(() => {
    setConfig(getPerfConfig());
    return subscribePerf(setConfig);
  }, []);

  return config;
};
