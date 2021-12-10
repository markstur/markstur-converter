import { ObjectFactory } from 'typescript-ioc';
import { initGlobalTracer, Tracer } from 'opentracing';

let tracer: Tracer;
function initTracer(): Tracer {
  const newTracer: Tracer = new Tracer();

  initGlobalTracer(newTracer);

  return newTracer;
}

const noopTracerFactory: ObjectFactory = () => {
  if (!tracer) {
    tracer = initTracer();
  }

  return tracer;
};

export default noopTracerFactory;
