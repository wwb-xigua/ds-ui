import * as DatafeUI from '../../packages';
import type { App } from 'vue';

const datafe = DatafeUI.create({
  components: [DatafeUI.SModal, DatafeUI.SDrawer, DatafeUI.STable, DatafeUI.SForm, DatafeUI.SIcon],
});

export function setupDatafe(app: App<Element>) {
  app.use(datafe);
}
