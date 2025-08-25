// src/components/__tests__/AboutModal.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AboutModal } from '../AboutModal';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock: gibt Schlüssel zurück
  }),
}));

describe('AboutModal', () => {
  it('zeigt Titel wenn geöffnet', () => {
    render(<AboutModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('about.title')).toBeInTheDocument();
  });

  it('rendered nicht wenn geschlossen', () => {
    const { container } = render(<AboutModal isOpen={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
