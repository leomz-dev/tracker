import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

const FloatingAdd = ({ onClick, label = 'Agregar' }) => (
  <Button
    size="icon"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="fixed bottom-24 right-5 z-30 h-14 w-14 rounded-full shadow-lg glow-primary sm:hidden"
  >
    <Plus className="h-6 w-6" aria-hidden="true" />
  </Button>
);

export default FloatingAdd;
