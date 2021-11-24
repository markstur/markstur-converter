import {ContainerConfiguration, Scope} from 'typescript-ioc';
import {HelloWorldApi} from './hello-world.api';
import {HelloWorldService} from './hello-world.service';
import {ConverterApi} from './converter.api';
import {ConverterService} from './converter.service';

const config: ContainerConfiguration[] = [
  {
    bind: HelloWorldApi,
    to: HelloWorldService,
    scope: Scope.Singleton,
  },
  {
    bind: ConverterApi,
    to: ConverterService,
    scope: Scope.Singleton,
  },
];

export default config;
