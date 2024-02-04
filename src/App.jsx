import Home from "@/components/Home";
import ImageModal from "@/components/ImageModal";
import KeyboardHandler from "@/components/KeyboardHandler";
import ScrollHandler from "@/components/ScrollHandler";

import "./App.css";

const App = () => (
  <>
    <ScrollHandler />
    <KeyboardHandler>
      <Home />
      <ImageModal />
    </KeyboardHandler>
  </>
);

export default App;