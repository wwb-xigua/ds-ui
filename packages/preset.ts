import { SCard, SContainer, SDrawer, SForm, SIcon, SMessage, SModal, STable } from './components';
import create from './create';

/**
 * Components registered by the default preset.
 *
 * The list is explicit on purpose. Iterating over every barrel export would also
 * register plain helper functions (`useForm`, `useTable`, `getColumnDisplayTitle`, ...)
 * as global Vue components under names such as `SuseForm`.
 */
const components = [SCard, SContainer, SDrawer, SForm, SIcon, SMessage, SModal, STable];

const DsUI = create({
  components,
});

export default DsUI;
export const install = DsUI.install;
export { components as defaultComponents };
