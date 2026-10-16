import type { App, Component } from 'vue';

export interface SUiInstance {
  install: (app: App) => void;
}

export interface DsUICreateOptions {
  /** Components to register. Names are read from each component itself. */
  components?: Component[];
  /** Prefix prepended to every registered component name. Defaults to `S`. */
  componentPrefix?: string;
}

/** A component that declares its own registration name and optional aliases. */
type NamedComponent = Component & {
  name?: string;
  alias?: string[];
};

function create({ componentPrefix = 'S', components = [] }: DsUICreateOptions = {}): SUiInstance {
  const installTargets: App[] = [];

  function registerComponent(app: App, name: string, component: Component): void {
    const resolved = componentPrefix + name;
    if (!app.component(resolved)) {
      app.component(resolved, component);
    }
  }

  function install(app: App): void {
    // Guard against installing twice on the same app instance.
    if (installTargets.includes(app)) return;
    installTargets.push(app);

    components.forEach((component) => {
      const { name, alias } = component as NamedComponent;

      // A component without a name would otherwise register as `Sundefined`.
      if (!name) {
        if (import.meta.env.DEV) {
          console.warn(
            '[ds-ui] skipping a component that has no name. ' +
              'Add `name="..."` to its <script setup> tag so it can be registered globally.',
            component,
          );
        }
        return;
      }

      registerComponent(app, name, component);
      alias?.forEach((aliasName) => registerComponent(app, aliasName, component));
    });
  }

  return { install };
}

export default create;
