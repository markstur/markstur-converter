import { ContainerConfiguration } from 'typescript-ioc';

import { TracerApi } from './tracer.api';
import noopTracerFactory from './noop-tracer.factory';

const config: ContainerConfiguration[] = [
  {
    bind: TracerApi,
    factory: noopTracerFactory,
  },
];

export default config;
