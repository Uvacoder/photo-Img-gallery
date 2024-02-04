import { signal } from "@preact/signals-react";

const isShowingFacts = signal(false);
const modalImage = signal(null);
const scaleTitlebar = signal(false);

export { isShowingFacts, modalImage, scaleTitlebar };
