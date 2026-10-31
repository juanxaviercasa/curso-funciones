/** Development-only preview; the platform owns the application route. */
import { createRoot } from 'react-dom/client';
import { FunctionsLab } from './FunctionsLab';

const container = document.getElementById('lab-preview');
if (container) createRoot(container).render(<FunctionsLab />);
